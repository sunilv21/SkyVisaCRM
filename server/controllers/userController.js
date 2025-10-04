import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, isActive } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: role || "employee",
      department,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const userObj = user.toObject();
    userObj.id = userObj._id.toString();
    delete userObj.password; // Don't send password back
    
    res.status(201).json(userObj);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    
    // Map _id to id for frontend compatibility
    const usersWithId = users.map(user => {
      const userObj = user.toObject();
      userObj.id = userObj._id.toString();
      return userObj;
    });
    
    res.json(usersWithId);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, department, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Only update password if provided
    if (password) {
      user.password = password;
    }

    await user.save();
    
    const userObj = user.toObject();
    userObj.id = userObj._id.toString();
    delete userObj.password;
    
    res.json(userObj);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};
