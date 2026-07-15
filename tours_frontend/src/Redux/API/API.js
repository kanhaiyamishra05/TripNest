import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const baseUrl = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

// SignUP
export const userSignUP = createAsyncThunk(
  "userSignUp",
  async (credintials) => {
    try {
      const request = await axios.post(`${baseUrl}/auth/signup`, credintials);

      return request;
    } catch (error) {
      if (error.status === 403) {
        return { error: "User already exists!" };
      }
    }
  }
);

// SignIn

export const userLogin = createAsyncThunk(
  "userLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      // Making the POST request and waiting for the response
      const response = await axios.post(`${baseUrl}/auth/login`, credentials);
      return response.data; // Return token string directly
    } catch (error) {
      const errorMsg = error.response?.data || error.message || "Invalid Email or Password";
      return rejectWithValue(errorMsg);
    }
  }
);

// admin get all tours

export const adminTours = createAsyncThunk("adminTours", async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const response = await axios.get(`${baseUrl}/admin/tours`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
});

//get admin tour by Id

export const fetchTourDetails = createAsyncThunk(
  "fetchTourDetails",
  async (tourId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const response = await axios.get(`${baseUrl}/admin/tours/${tourId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// get admin all transport

export const adminTransport = createAsyncThunk("adminTransport", async () => {
  try {
    const token = localStorage.getItem('token');
    if(!token){
      return;
    }
    const response = axios.get(`${baseUrl}/admin/transports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
});

// get admin all location

export const adminLocation = createAsyncThunk("adminLocation", async () => {
  try {
    const token = localStorage.getItem('token');
    if(!token){
      return;
    }
    const response = axios.get(`${baseUrl}/admin/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
});
// get admin tour delete

export const deleteTour = createAsyncThunk("deleteTour", async (tourId) => {
  try {
    const token = localStorage.getItem('token');
    if(!token){
      return;
    }
    const response = axios.delete(`${baseUrl}/admin/tours/${tourId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
});

// get admin all lodging

export const adminLodging = createAsyncThunk("adminLodging", async () => {
  try {
    const token = localStorage.getItem('token');
    if(!token){
      return;
    }
    const response = axios.get(`${baseUrl}/admin/lodgings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
});

// update tour

export const updateTour = createAsyncThunk(
  "updateTour",
  async ({ tourId, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${baseUrl}/admin/tours/${tourId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important: use multipart/form-data for file uploads
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Update tour error:", error);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// update location

export const editLocation = createAsyncThunk(
  "editLocation",
  async ({ locationId, updatedLocation }) => {
    const token = localStorage.getItem("token");
    if(!token){
      return;
    }
    const response = await axios.put(
      `${baseUrl}/admin/locations/${locationId}`,
      updatedLocation,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  }
);

// update transport

export const editTransport = createAsyncThunk(
  "editTransport",
  async ({ transportId, updatedTransport }) => {
    const token = localStorage.getItem("token");
    if(!token){
      return;
    }
    const response = await axios.put(
      `${baseUrl}/admin/transports/${transportId}`,
      updatedTransport,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  }
);

// update lodging

export const editLodging = createAsyncThunk(
  "editLodging",
  async ({ lodgingId, updatedLodging }) => {
    const token = localStorage.getItem("token");
    if(!token){
      return;
    }
    const response = await axios.put(
      `${baseUrl}/admin/lodgings/${lodgingId}`,
      updatedLodging,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  }
);

// admin ticket Summary

export const allTickets = createAsyncThunk("allTickets", async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const response = axios.get(`${baseUrl}/admin/tourTicketSummary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
});

// admin tour book details
export const bookDetails = createAsyncThunk("bookDetails", async (tourId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const response = await axios.get(`${baseUrl}/admin/tourDetails/${tourId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
});

// user section-----

// user get all tours

export const userTours = createAsyncThunk("userTours", async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const response = await axios.get(`${baseUrl}/customer/tours`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
});

// get user tour by ID
export const UserTourDetail = createAsyncThunk(
  "UserTourDetails",
  async (tourId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const response = await axios.get(`${baseUrl}/customer/tours/${tourId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// user book tour

export const userBook = createAsyncThunk(
  "userBook",

  async ({ tourId, numberOfTickets, couponCode }, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("No authentication token found");
    }
    try {
      let url = `${baseUrl}/customer/create-payment-intent/${tourId}?numberOfTickets=${numberOfTickets}`;
      if (couponCode) {
        url += `&couponCode=${couponCode}`;
      }
      const request = await axios.post(
        url,
        // The second argument should be the request body (if any)
        {},  // Empty object if no body is needed
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return request.data;  // Return .data instead of entire request
    } catch (error) {
      const errorMsg = error.response && error.response.data && error.response.data.error
        ? error.response.data.error
        : error.message;
      console.error('Booking error:', errorMsg);
      return rejectWithValue({ message: errorMsg });
    }
  }
);

// user confirm booking
export const confirmBooking = createAsyncThunk(
  "confirmBooking",
  async ({ bookingId,paymentIntentId}, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${baseUrl}/customer/confirm-payment/${bookingId}?paymentIntentId=${paymentIntentId}`,
    {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// user get all bookings
export const userBookings = createAsyncThunk(
  "userBookings",
  async (_, { rejectWithValue }) => {
    try {
      const activeToken = localStorage.getItem("token") || token;
      if (!activeToken) {
        return rejectWithValue("No active token found");
      }
      const response = await axios.get(`${baseUrl}/customer/bookings`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// delete location
export const deleteLocation = createAsyncThunk("deleteLocation", async (locationId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${baseUrl}/admin/locations/${locationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// delete lodging
export const deleteLodging = createAsyncThunk("deleteLodging", async (lodgingId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${baseUrl}/admin/lodgings/${lodgingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// delete transport
export const deleteTransport = createAsyncThunk("deleteTransport", async (transportId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${baseUrl}/admin/transports/${transportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// wishlist toggle
export const toggleWishlist = createAsyncThunk("toggleWishlist", async (tourId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${baseUrl}/customer/wishlist/toggle/${tourId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// fetch wishlist
export const fetchWishlist = createAsyncThunk("fetchWishlist", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}/customer/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// add review
export const addReview = createAsyncThunk("addReview", async ({ tourId, rating, comment }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${baseUrl}/customer/reviews/${tourId}`, { rating, comment }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// fetch reviews
export const fetchReviews = createAsyncThunk("fetchReviews", async (tourId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/public/reviews/tour/${tourId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// cancel booking
export const cancelBooking = createAsyncThunk("cancelBooking", async (bookingId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${baseUrl}/customer/bookings/${bookingId}/cancel`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// validate coupon
export const validateCoupon = createAsyncThunk("validateCoupon", async (code, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/public/coupons/validate/${code}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// fetch customer coupons
export const fetchCustomerCoupons = createAsyncThunk("fetchCustomerCoupons", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}/customer/coupons`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// fetch analytics
export const fetchAnalytics = createAsyncThunk("fetchAnalytics", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}/admin/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// fetch coupons
export const fetchCoupons = createAsyncThunk("fetchCoupons", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}/admin/coupons`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// create coupon
export const createCoupon = createAsyncThunk("createCoupon", async ({ code, discountPercentage }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${baseUrl}/admin/coupons`, { code, discountPercentage }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// delete coupon
export const deleteCoupon = createAsyncThunk("deleteCoupon", async (couponId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${baseUrl}/admin/coupons/${couponId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// fetch user profile
export const getUserProfile = createAsyncThunk("getUserProfile", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// update user profile
export const updateUserProfile = createAsyncThunk("updateUserProfile", async (profileData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${baseUrl}/auth/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// send signup otp
export const sendSignupOtp = createAsyncThunk("sendSignupOtp", async (phone, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${baseUrl}/auth/send-otp?phone=${encodeURIComponent(phone)}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// verify signup otp
export const verifySignupOtp = createAsyncThunk("verifySignupOtp", async ({ phone, otp }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${baseUrl}/auth/verify-otp?phone=${encodeURIComponent(phone)}&otp=${encodeURIComponent(otp)}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});
