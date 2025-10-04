import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, passwordProvided: !!password });
    
    const user = await User.findOne({ email });
    console.log("User found:", !!user);

    if (user) {
      const isMatch = await user.matchPassword(password);
      console.log("Password match:", isMatch);
      
      if (isMatch) {
        res.json({
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id),
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Register user (for seeding/testing purposes)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "employee",
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
