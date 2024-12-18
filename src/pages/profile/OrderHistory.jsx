import React, { useEffect, useState } from "react";
import Modal from "react-modal"; // npm install react-modal
import "./OrderHistory.scss";
import ProfileNav from "./ProfileNav";
import { FaStar } from "react-icons/fa"; // npm install react-icons
import Pagination from "@mui/material/Pagination"; // Add this import

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [feedbackModalIsOpen, setFeedbackModalIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(null);
  const [page, setPage] = useState(1);
  const [ordersPerPage] = useState(10); // Show 10 orders per page

  // Calculate pagination
  const indexOfLastOrder = page * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedUserID = localStorage.getItem("userID");
    console.log("Retrieved userID:", storedUserID);

    if (storedUserID) {
      setUserID(storedUserID);

      // Fetch orders for the user
      fetch(`https://localhost:7194/api/Orders/user/${storedUserID}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched orders:", data);
          setOrders(data);
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
          setError(error.message);
        });

      // Fetch payment methods for the user
      fetch(`https://localhost:7194/api/Payments/by-user/${storedUserID}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched payment methods:", data);
          setPaymentMethods(data);
        })
        .catch((error) => {
          console.error("Error fetching payment methods:", error);
          setError(error.message);
        });
    } else {
      console.log("No userID found in localStorage.");
      setError("No userID found in localStorage.");
    }
  }, []);

  const fetchOrderDetails = (orderId) => {
    fetch(`https://localhost:7194/api/Orders/${orderId}/details`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Please make payment for order so that you could view details");
        }
        return response.json();
      })
      .then((orderData) => {
        if (!orderData.orderDetails || !Array.isArray(orderData.orderDetails)) {
          throw new Error("Order details are not in the expected format");
        }
        return orderData.orderDetails;
      })
      .then((detailsArray) => {
        const productDetailsPromises = detailsArray.map((item) =>
          fetch(`https://localhost:7194/api/Product/details/${item.productId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to fetch product details");
              }
              return response.json();
            })
            .then((product) => ({
              ...item,
              productCode: product.productCode,
              price: product.price,
              fabricName: product.fabricName,
              liningName: product.liningName,
              styleOptions: product.styleOptions
            }))
        );

        return Promise.all(productDetailsPromises);
      })
      .then(setOrderDetails)
      .catch((error) => {
        console.error("Error fetching order details:", error);
        setError(error.message);
      });
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrder(orderId);
    setOrderDetails([]); // Clear previous details
    fetchOrderDetails(orderId);
    setModalIsOpen(true); // Open modal
  };

  const currentDate = new Date().toLocaleDateString("en-CA");

  const handleFeedbackSubmit = async (orderId) => {
    const feedback = {
      feedbackId: 0,
      comment: comment,
      rating: rating,
      dateSubmitted: currentDate,
      userId: parseInt(userID),
      orderId: orderId,
    };

    console.log("Submitting feedback:", feedback); // Log the feedback object

    try {
      const response = await fetch(
        "https://localhost:7194/api/Feedback/feedbackfororder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedback),
        }
      );

      console.log("Response status:", response.status); // Log the response status

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      const responseData = await response.json();
      console.log("Response data:", responseData); // Log the response data

      setFeedbackModalIsOpen(false);
      setComment("");
      setRating(5);
      alert("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(error.message);
    }
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      borderRadius: "10px",
      padding: "20px",
      maxWidth: "800px",
      width: "100%",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  return (
    <div className="profile-page">
      <ProfileNav />
      <div className="content-container">
        <h1 className="order-history-title">Order History</h1>
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="order-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Order Date</th>
                    <th>Shipped Date</th>
                    <th>Status</th>
                    <th>Total Price</th>
                    <th>Deposit</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => {
                      const paymentMethod = paymentMethods.find(
                        (method) => method.orderId === order.orderId
                      );

                      return (
                        <tr key={order.orderId}>
                          <td>{order.orderId}</td>
                          <td>
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            {order.shippedDate
                              ? new Date(order.shippedDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <span
                              className={`status ${
                                order.status
                                  ? order.status.toLowerCase()
                                  : ""
                              }`}
                            >
                              {order.status || ""}
                            </span>
                          </td>
                          <td>${order.totalPrice?.toFixed(2) || ""}</td>
                          <td>${order.deposit?.toFixed(2) || ""}</td>
                          <td>
                            {paymentMethod ? paymentMethod.method : "Paypal"}
                          </td>
                          <td>
                            <button
                              onClick={() => handleViewDetails(order.orderId)}
                            >
                              View Details
                            </button>
                            {order.status === "Shipped" && (
                              <button
                                className="received-button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Would you like to provide feedback for this order?"
                                    )
                                  ) {
                                    setSelectedOrder(order.orderId);
                                    setFeedbackModalIsOpen(true);
                                  }
                                }}
                              >
                                Received
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add pagination controls */}
            {orders.length > ordersPerPage && (
              <div className="pagination-container">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          style={customStyles}
          contentLabel="Order Details Modal"
        >
          <div className="order-details-modal">
            <div className="modal-header">
              <h2>Order Details #{selectedOrder}</h2>
              <button onClick={() => setModalIsOpen(false)} className="close-button">×</button>
            </div>

            {orderDetails.length > 0 ? (
              <div className="order-details-content">
                {orderDetails.map((detail) => (
                  <div key={detail.productId} className="product-card">
                    <div className="product-header">
                      <div className="product-title">
                        <h3>{detail.productCode}</h3>
                        <span className="quantity-badge">{detail.quantity} items</span>
                      </div>
                      <div className="product-price">${detail.price?.toFixed(2) || "N/A"}</div>
                    </div>

                    <div className="product-details-grid">
                      <div className="detail-section">
                        <h4>Fabric Details</h4>
                        <p>{detail.fabricName}</p>
                      </div>

                      <div className="detail-section">
                        <h4>Lining Details</h4>
                        <p>{detail.liningName}</p>
                      </div>

                      <div className="detail-section style-section">
                        <h4>Style Specifications</h4>
                        <div className="style-options-grid">
                          {detail.styleOptions && detail.styleOptions.map((style, index) => (
                            <div key={index} className="style-option-item">
                              <span className="option-type">{style.optionType}</span>
                              <span className="option-value">{style.optionValue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="product-footer">
                      <div className="subtotal">
                        <span>Subtotal</span>
                        <span className="amount">${(detail.quantity * detail.price)?.toFixed(2) || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="order-summary-card">
                  <h3>Order Summary</h3>
                  <div className="summary-content">
                    <div className="summary-row">
                      <span>Total Items</span>
                      <span>{orderDetails.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Amount</span>
                      <span>
                        ${orderDetails
                          .reduce((sum, item) => sum + item.quantity * item.price, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading order details...</p>
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={feedbackModalIsOpen}
          onRequestClose={() => setFeedbackModalIsOpen(false)}
          style={customStyles}
          contentLabel="Feedback Modal"
        >
          <h2>Provide Feedback for Order #{selectedOrder}</h2>
          <div className="star-rating">
            {[...Array(5)].map((star, index) => {
              const ratingValue = index + 1;
              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    onClick={() => setRating(ratingValue)}
                  />
                  <FaStar
                    className="star"
                    color={
                      ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"
                    }
                    size={30}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(null)}
                  />
                </label>
              );
            })}
          </div>
          <textarea
            placeholder="Please share your feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <div className="modal-buttons">
            <button onClick={() => handleFeedbackSubmit(selectedOrder)}>
              Submit
            </button>
            <button onClick={() => setFeedbackModalIsOpen(false)}>
              Cancel
            </button>
          </div>
        </Modal>

        <a className="continue-shopping" href="#">
          Continue Shopping
        </a>
      </div>
    </div>
  );
};

export default OrderHistory;
