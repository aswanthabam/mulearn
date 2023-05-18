import { ToastId, UseToastOptions } from "@chakra-ui/react";
import React from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import {
  privateGateway,
  publicGateway,
  // publicGatewayAuth
} from "../../../../../src/services/apiGateways";
import { authRoutes, dashboardRoutes } from "../../../../../src/services/urls";

type setMuID = React.Dispatch<React.SetStateAction<string>>;
type setStatus = React.Dispatch<React.SetStateAction<number>>;
type setHasError = React.Dispatch<React.SetStateAction<boolean>>;

export const forgetPassword = (
  emailOrMuid: string,
  toast: (options?: UseToastOptions | undefined) => ToastId,
  navigate: NavigateFunction
) => {
  publicGateway
  // publicGatewayAuth
    .post(authRoutes.forgetPassword, { emailOrMuid })
    .then((response) => {
      toast({
        title: "Token Mail Sent",
        description: "Kindly check your mail for the reset password link",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    })
    .catch((error) => {
      toast({
        title: error.response?.data?.message?.general[0],
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
};

export const login = (
  emailOrMuid: string,
  password: string,
  toast: (options?: UseToastOptions | undefined) => ToastId,
  navigate: NavigateFunction
) => {
	publicGateway
	// publicGatewayAuth
    .post(authRoutes.login, { emailOrMuid, password })
    .then((response) => {
      if (response.data.hasError == false) {
        console.log(response.data.response.accessToken);
        localStorage.setItem("accessToken", response.data.response.accessToken);
        localStorage.setItem(
          "refreshToken",
          response.data.response.refreshToken
        );
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        privateGateway
          .get(dashboardRoutes.getInfo)
          .then((response) => {
            console.log(response);
            localStorage.setItem(
              "userInfo",
              JSON.stringify(response.data.response)
            );
            if (response.data.response.existInGuild) {
              navigate("/profile");
            } else {
              navigate("/connect-discord");
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
    .catch((error) => {
      toast({
        title: error.response.data.message.general[0],
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
};

export const getMuid = (
  token: string,
  toast: (options?: UseToastOptions | undefined) => ToastId,
  navigate: NavigateFunction,
  setMuID: setMuID
) => {
	publicGateway
	// publicGatewayAuth
    .post(authRoutes.getMuid.replace("${token}", token))
    .then((response) => {
      console.log(response.data);
      toast({
        title: "User Verified",
        description: "Your Token has been validated,reset your password",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setMuID(response.data.response.muid);
    })
    .catch((error) => {
      toast({
        title: "Invalid Token",
        description: "Make sure you entered the correct token, try again",
        status: "error",
        duration: 4000,
        isClosable: true,
      });

      setTimeout(() => {
        navigate("/forgot-password");
      }, 5000);
    });
};

export const resetPassword = (
  token: string,
  password: string,
  toast: (options?: UseToastOptions | undefined) => ToastId,
  navigate: NavigateFunction
) => {
	// publicGatewayAuth
	publicGateway
    .post(authRoutes.resetPassword.replace("${token}", token), { password })
    .then((response) => {
      if (response.data.statusCode === 200) {
        toast({
          title: "Password Reset Successful",
          description: "You will be redirected to login page shortly",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          navigate("/login");
        }, 4000);
      }
    })
    .catch((error) => {
      toast({
        title: "Invalid Token",
        description: "Kindly request for a new token, you will be redirected.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => {
        navigate("/forgot-password");
      }, 4000);
    });
};

export const requestEmailOrMuidOtp = (
  emailOrMuid: string,
  toast: (options?: UseToastOptions | undefined) => ToastId,
  setHasError: setHasError,
  setStatus: setStatus
) => {
	publicGateway
	// publicGatewayAuth
    .post(authRoutes.requestEmailOrMuidOtp, { emailOrMuid })
    .then((response) => {
      setStatus(response.data.statusCode);
      if (response.data.hasError == false) {
        setHasError(false);
        toast({
          title: "OTP Sended",
          description: "OTP has been sent to your email",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    })
    .catch((error) => {
      toast({
        title: "Invalid Email or Muid",
        description: "Kindly enter a valid email or Muid",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    });
};

export const otpVerification = (
  emailOrMuid: string,
  otp: string,
  toast: (options?: UseToastOptions | undefined) => ToastId,
  navigate: NavigateFunction
) => {
	publicGateway
	// publicGatewayAuth
    .post(authRoutes.otpVerification, { emailOrMuid, otp })
    .then((response) => {
      console.log(response.data);
      localStorage.setItem("accessToken", response.data.response.accessToken);
      localStorage.setItem("refreshToken", response.data.response.refreshToken);
      if (response.data.hasError == false) {
        toast({
          title: "OTP verified",
          description: "You will be redirected to home page",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      privateGateway
        .get(dashboardRoutes.getInfo)
        .then((response) => {
          console.log(response);
          localStorage.setItem(
            "userInfo",
            JSON.stringify(response.data.response)
          );
          if (response.data.response.existInGuild) {
            navigate("/profile");
          } else {
            navigate("/connect-discord");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      toast({
        title: "Invalid OTP",
        description: "Kindly enter a valid OTP",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    });
};