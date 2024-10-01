import userModels from "../models/userModels.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import nodemalier from "nodemailer";
import bcrypt from "bcrypt"
//post register
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    // validations
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }
    //check user
    const exisitingUser = await userModels.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register Please Login",
      });
    }
    // register user
    const hashedPassword = await hashPassword(password);
    // save
    const user = await new userModels({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
    }).save();
    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in register",
      error,
    });
  }
};
// post login
export const loginControllers = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid Email Or Password",
      });
    }
    //check user
    const user = await userModels.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is no registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECURE, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: "Login Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};
export const forgotController = async (req, res) => {
  try {
    const { email } = req.body;
    const isUser = await userModels.findOne({ email });
    if (isUser) {
      // generate token
      const token = JWT.sign({ userId: isUser._id }, process.env.JWT_SECURE, {
        expiresIn: "1h",
      });
      // const link = `http://localhost:3000/reset/${user._id}/${token}`;
      const transport = nodemalier.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: "nabiullahansari4321@gmail.com",
        to: email,
        subject: `Password Reset Request`,
        text: `Click on this link to reset your password: http://localhost:3000/reset_password/${isUser._id}/${token}`,
      };
      transport.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(400).send({ message: "Error" });
        }
        return res.status(200).send({ message: "email sended" });
      });
    } else {
      return res.status(200).send({
        message: "Invalid user",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in forgot password",
    });
  }
};
export const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  try {
    if (newPassword && confirmPassword && id && token) {
      if (newPassword === confirmPassword) {
        // const secretkey = user._id + "pleasesubscribe";
        const isUser = await userModels.findById(id);
        const isValid = await JWT.verify(token, process.env.JWT_SECURE);
        if (isValid) {
          // password hashing
          const genSalt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, genSalt);
          const isSuccess = await userModels.findByIdAndUpdate(isUser._id, {
            $set: {
              password: hashedPassword,
            },
          });
          if (isSuccess) {
            return res.status(200).send({
              message: "Password chnages successfuly",
            });
          }
        } else {
          return res.status(400).send({
            message: "link has been expired",
          });
        }
      } else {
        return res.status(400).send({
          message: "password and conform password does bot match",
        });
      }
    } else {
      return res.status(400).send({
        message: "All Fields Required",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }

};
// test
export const testController = (req, res) => {
  res.send("protected Route");
};
