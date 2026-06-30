import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import BackButton from "../components/BackButton";
import { ApiResponse, User } from "../types/api";

function EditProfile() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
        const userData = response.data.data;
        if (userData) {
          setEmail(userData.email);
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setPhone(userData.phone || "");
          setAddress(userData.address || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error loading your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const isValid = firstName && lastName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const userId = localStorage.getItem("userId");
    setSaving(true);
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${userId}`, {
        firstName,
        lastName,
        phone,
        address,
      });

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        navigate("/profile");
      } else {
        toast.error(response.data.msg || "Could not update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-brown-500 px-3 px-md-4 px-lg-5"
      style={{ paddingBottom: 100 }}
    >
      <div className="align-self-start mb-4 ps-2 ps-md-4">
        <BackButton />
      </div>
      <div
        className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5"
        style={{ maxWidth: 804 }}
      >
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-5">
          <h2 className="fs-display-3 text-heading-black fw-bold text-start mb-0">
            Edit your{" "}
            <span className="d-block">
              <span className="text-orange-500">Profile</span>{" "}
              <span className="text-heading-black">Information.</span>
            </span>
          </h2>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex gap-3">
              <FormInput
                label="First Name"
                type="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
                className="border-bottom border-2"
              />
              <FormInput
                label="Last Name"
                type="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
                className="border-bottom border-2"
              />
            </div>
            <div className="d-flex flex-column gap-1">
              <span className="fs-5 text-neutral-text-gray font-dm-sans fw-semibold">Email</span>
              <span className="fs-5 text-heading-black">{email}</span>
            </div>
            <FormInput
              label="Phone Number"
              type="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="border-bottom border-2"
            />
            <FormInput
              label="Address"
              type="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              className="border-bottom border-2"
            />
          </div>

          <Button
            text={saving ? "Saving..." : "Save Changes"}
            type="submit"
            className="w-100"
            disabled={!isValid || saving}
          />
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
