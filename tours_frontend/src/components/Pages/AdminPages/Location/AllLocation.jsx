import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { adminLocation, deleteLocation } from "../../../../Redux/API/API";
import { MapPin, Globe, Clock, Route, Trash2 } from "lucide-react";
import { toast } from "sonner";

const LocationCard = ({ location, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-100 hover:shadow-xl transition-all duration-300 ease-in-out relative group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <MapPin className="text-blue-600 w-6 h-6" />
          <h3 className="ml-3 text-lg font-semibold text-gray-800">
            {location.fromLocation} to {location.toLocation}
          </h3>
        </div>
        <button
          onClick={() => onDelete(location.id)}
          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
          title="Delete Route"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <Globe className="w-4 h-4 mr-2" />
          <span className="text-sm">Country: {location.country}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Route className="w-4 h-4 mr-2" />
          <span className="text-sm">Distance: {location.distance} km</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm">
            Estimated Travel Time: {location.estimatedTravelTime}
          </span>
        </div>
        <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 mt-2">
          <p>
            {location.locationDescription ||
              "No description available for this location route."}
          </p>
        </div>
      </div>
    </div>
  );
};

const AllLocation = () => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(adminLocation())
      .then((response) => {
        if (response.payload && response.payload.data) {
          setLocations(response.payload.data);
          setLoading(false);
        } else {
          setError("No location data found");
          setLoading(false);
        }
      })
      .catch((err) => {
        setError("Error fetching location data");
        setLoading(false);
        console.error(err);
      });
  }, [dispatch]);

  const handleDelete = async (locationId) => {
    if (!window.confirm("Are you sure you want to delete this location route?")) return;
    try {
      const response = await dispatch(deleteLocation(locationId));
      if (response.type.endsWith("/fulfilled")) {
        toast.success("Location route deleted successfully");
        setLocations(locations.filter((loc) => loc.id !== locationId));
      } else {
        toast.error("Failed to delete location route. It might be linked to a tour.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting location route");
    }
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.fromLocation.toLowerCase().includes(filter.toLowerCase()) ||
      location.toLocation.toLowerCase().includes(filter.toLowerCase()) ||
      location.country.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Locations
      </h1>

      {/* Search/Filter Input */}
      <div className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Filter locations by from, to, or country"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredLocations.length === 0 ? (
        <div className="text-center text-gray-500">
          No location routes available
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <LocationCard key={location.id} location={location} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllLocation;
