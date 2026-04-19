import { useState } from "react";
import { registerUser } from "../services/authService";
import "../styles/register.css";

function RegisterForm() {

  const [formData, setFormData] = useState({
      name:"",
      email:"",
      phone:"",
      password:"",
      confirmPassword:""
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const validateForm = () => {

    if(!formData.name.trim()){
      alert("Name is required");
      return false;
    }

    if(!formData.email.includes("@")){
      alert("Invalid email");
      return false;
    }

    if(formData.phone.length < 10){
      alert("Invalid phone number");
      return false;
    }

    // Same rule as backend
    const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if(!passwordRegex.test(formData.password)){
      alert(
       "Password must contain uppercase, lowercase, number and special character"
      );
      return false;
    }

    if(formData.password !== formData.confirmPassword){
      alert("Passwords do not match");
      return false;
    }

    return true;
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if(!validateForm()){
      return;
    }

    try {

      // Don't send confirmPassword to backend
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };

      await registerUser(payload);

      alert("Registration Successful");

      setFormData({
        name:"",
        email:"",
        phone:"",
        password:"",
        confirmPassword:""
      });

    } catch (error) {

  console.error(error);

  if (error.response) {

    console.log(error.response.data);

    alert(
      "Error: " +
      JSON.stringify(error.response.data)
    );

  } else {

    alert("Server connection error");

  }

}

  };



 return (

  <form
    className="register-form"
    onSubmit={handleSubmit}
  >

    <h2>Create Account</h2>

    <input
      name="name"
      placeholder="Full Name"
      value={formData.name}
      onChange={handleChange}
    />

    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
    />

    <input
      name="phone"
      placeholder="Phone Number"
      value={formData.phone}
      onChange={handleChange}
    />

    <input
      type="password"
      name="password"
      placeholder="Password"
      value={formData.password}
      onChange={handleChange}
    />

    <input
      type="password"
      name="confirmPassword"
      placeholder="Confirm Password"
      value={formData.confirmPassword}
      onChange={handleChange}
    />

    <button type="submit">
      Register
    </button>

  </form>

 );

}

export default RegisterForm;