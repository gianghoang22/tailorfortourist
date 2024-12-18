import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./StoreManagement.scss";

const StoreManagement = () => {
  const [storeData, setStoreData] = useState([]);
  const [newStore, setNewStore] = useState({
    storeId: null,
    userId: 0,
    name: "",
    address: "",
    contactNumber: "",
    storeCode: 0,
    openTime: "",
    closeTime: "",
    staffIDs: "",
    districtID: 0,
    imgUrl: "",
    status: "Active",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://localhost:7194/api/Store");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setStoreData(data);
      } catch (error) {
        console.error("Error fetching store data:", error);
        setError("Error fetching store data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStoreData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStore({ ...newStore, [name]: value });
  };

  const handleAdd = async () => {
    try {
      // Validate required fields
      const { name, address, contactNumber, openTime, closeTime } = newStore;
      if (!name || !address || !contactNumber || !openTime || !closeTime) {
        setError(
          "Required fields are missing. Please complete all required fields."
        );
        return;
      }

      // Convert numeric fields
      const storeToAdd = {
        ...newStore,
        storeCode: parseInt(newStore.storeCode),
        districtID: parseInt(newStore.districtID),
        status: "Active",
      };

      const response = await fetch("https://localhost:7194/api/Store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(storeToAdd),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Server error response:", errorData);
        throw new Error(`Failed to add store: ${response.status}`);
      }

      // Handle the response
      const contentType = response.headers.get("content-type");
      let addedStore;
      if (contentType && contentType.includes("application/json")) {
        addedStore = await response.json();
      } else {
        addedStore = storeToAdd;
      }

      setStoreData([...storeData, addedStore]);
      setError(null);
      setShowSuccessMessage(true);

      // Reset form
      setNewStore({
        storeId: 0,
        userId: 0,
        name: "",
        address: "",
        contactNumber: "",
        storeCode: 0,
        openTime: "",
        closeTime: "",
        staffIDs: "",
        districtID: 0,
        imgUrl: "",
        status: "Active",
      });
    } catch (error) {
      console.error("Error adding new store:", error);
      setError(error.message || "Failed to add store");
    }
  };

  const handleEdit = (store) => {
    setNewStore(store);
    setEditIndex(store.storeId);
  };

  const handleUpdate = async () => {
    try {
      // Validate required fields
      if (!newStore.name || !newStore.address || !newStore.contactNumber) {
        setError("All fields are required. Please complete all fields.");
        return;
      }

      // Check for unique store name and contact number
      const isDuplicate = storeData.some(
        (store) =>
          (store.name === newStore.name ||
            store.contactNumber === newStore.contactNumber) &&
          store.storeId !== editIndex
      );
      if (isDuplicate) {
        setError(
          "Store name or contact number already exists. Please use unique values."
        );
        return;
      }

      const response = await fetch(
        `https://localhost:7194/api/Store/${editIndex}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newStore),
        }
      );

      // Check if response is 204 No Content
      if (response.status === 204) {
        // Update local state directly since we know the update was successful
        const updatedStores = storeData.map((s) =>
          s.storeId === editIndex ? { ...s, ...newStore } : s
        );
        setStoreData(updatedStores);
        setNewStore({
          storeId: 0,
          userId: 0,
          name: "",
          address: "",
          contactNumber: "",
          storeCode: 0,
          openTime: "",
          closeTime: "",
          staffIDs: "",
          districtID: 0,
          imgUrl: "",
          status: "Active",
        });
        setEditIndex(null);
        setError(null);
        setShowSuccessMessage(true);
        return;
      }

      // If not 204, try to parse response as JSON
      if (!response.ok) {
        let errorMessage = "Error updating store";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const updatedStore = await response.json();
      const updatedStores = storeData.map((s) =>
        s.storeId === editIndex ? updatedStore : s
      );
      setStoreData(updatedStores);
      setNewStore({
        storeId: 0,
        userId: 0,
        name: "",
        address: "",
        contactNumber: "",
        storeCode: 0,
        openTime: "",
        closeTime: "",
        staffIDs: "",
        districtID: 0,
        imgUrl: "",
        status: "Active",
      });
      setEditIndex(null);
      setError(null);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Error updating store:", error);
      setError(error.message);
    }
  };

  const handleStatusChange = async (storeId, newStatus) => {
    try {
      console.log("Current store data:", storeData);
      console.log("Changing store ID:", storeId);
      console.log("New status:", newStatus);

      const token = localStorage.getItem("token");

      // Find the current store data
      const currentStore = storeData.find((s) => s.storeId === storeId);
      if (!currentStore) {
        throw new Error("Store not found");
      }

      // Create the update object with all existing data plus new status
      const updateData = {
        storeId: currentStore.storeId,
        userId: currentStore.userId,
        name: currentStore.name,
        address: currentStore.address,
        contactNumber: currentStore.contactNumber,
        storeCode: currentStore.storeCode,
        openTime: currentStore.openTime,
        closeTime: currentStore.closeTime,
        staffIDs: currentStore.staffIDs,
        districtID: currentStore.districtID,
        imgUrl: currentStore.imgUrl,
        status: newStatus, // Make sure this is being updated
      };

      console.log("Sending update request:", updateData);

      const response = await fetch(
        `https://localhost:7194/api/Store/${storeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      console.log("Response status:", response.status);

      if (response.status === 204) {
        // Success - update local state
        setStoreData(
          storeData.map((s) =>
            s.storeId === storeId ? { ...s, status: newStatus } : s
          )
        );
        setError(null);
        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        throw new Error(`Error updating store status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStores = storeData.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="store-management">
      <h2>Store Management</h2>
      {error && <Alert severity="error">{error}</Alert>}
      {showSuccessMessage && (
        <Alert severity="success">Store successfully updated/added!</Alert>
      )}

      {isLoading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="header">
            <div className="form">
              <TextField
                label="Store Name"
                name="name"
                value={newStore.name}
                onChange={handleChange}
                variant="outlined"
                style={{ marginRight: "1rem" }}
              />
              <TextField
                label="Address"
                name="address"
                value={newStore.address}
                onChange={handleChange}
                variant="outlined"
                style={{ marginRight: "1rem" }}
              />
              <TextField
                label="Contact Number"
                name="contactNumber"
                value={newStore.contactNumber}
                onChange={handleChange}
                variant="outlined"
                style={{ marginRight: "1rem" }}
              />
              <TextField
                label="Store Code"
                name="storeCode"
                type="number"
                value={newStore.storeCode}
                onChange={handleChange}
                variant="outlined"
                style={{ marginRight: "1rem" }}
              />
              <TextField
                label="Open Time"
                name="openTime"
                type="time"
                value={newStore.openTime}
                onChange={handleChange}
                variant="outlined"
                style={{ marginRight: "1rem" }}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
              <TextField
                label="Close Time"
                name="closeTime"
                type="time"
                value={newStore.closeTime}
                onChange={handleChange}
                variant="outlined"
                style={{ marginRight: "1rem" }}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
              <TextField
                label="District ID"
                name="districtID"
                type="number"
                value={newStore.districtID}
                onChange={handleChange}
                variant="outlined"
                style={{ marginRight: "1rem" }}
              />
              <TextField
                label="Image URL"
                name="imgUrl"
                value={newStore.imgUrl}
                onChange={handleChange}
                variant="outlined"
                style={{ marginRight: "1rem" }}
              />
              {editIndex ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                >
                  Update Store
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleAdd}
                >
                  Add Store
                </Button>
              )}
            </div>

            <TextField
              label="Search by Store Name"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ margin: "1rem 0", marginLeft: "auto" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <TableContainer
            component={Paper}
            style={{
              maxWidth: "100%",
              overflowX: "auto",
              marginTop: "1rem",
            }}
          >
            <Table style={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    Store Name
                  </TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    Address
                  </TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    Contact Number
                  </TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    Store Code
                  </TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    Open Time
                  </TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    Close Time
                  </TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>Status</TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStores.map((s) => (
                  <TableRow key={s.storeId}>
                    <TableCell
                      style={{
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </TableCell>
                    <TableCell
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.address}
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {s.contactNumber}
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {s.storeCode}
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {s.openTime}
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {s.closeTime}
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {s.status}
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(s)}
                        style={{ marginRight: "0.5rem" }}
                        size="small"
                      >
                        Edit
                      </Button>
                      <Select
                        value={s.status || "Active"}
                        onChange={(e) =>
                          handleStatusChange(s.storeId, e.target.value)
                        }
                        size="small"
                        style={{ minWidth: "120px" }}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Deactive">Deactive</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default StoreManagement;
