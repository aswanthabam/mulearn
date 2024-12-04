import OnboardingHeader from "../OnboardingHeader/OnboardingHeader";
import OnboardingTemplate from "../OnboardingTeamplate/OnboardingTemplate";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { isDev } from "@/MuLearnServices/common_functions";
import * as z from "yup";
import styles from "./AccountCreationComponent.module.css";
import { FormikTextInputWithoutLabel as SimpleInput } from "@/MuLearnComponents/FormikComponents/FormikComponents";
import { HiEye } from "react-icons/hi";
import { HiEyeSlash } from "react-icons/hi2";
import { BiSupport } from "react-icons/bi";
import { PowerfulButton } from "@/MuLearnComponents/MuButtons/MuButton";
import { getDWMSDetails } from "../../services/newOnboardingApis";
import toast from "react-hot-toast";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { privateGateway, publicGateway } from "@/MuLearnServices/apiGateways";
import { onboardingRoutes } from "@/MuLearnServices/urls";

const scheme = z.object({
    email: z
        .string()
        .required(`Email is Required`)
        .min(5, `Email must be at least 3 characters`)
        .max(100, `Email must be at most 100 characters`),
    full_name: z
        .string()
        .required(`Full Name is Required`)
        .min(3, `Full Name must be at least 3 characters`)
        .max(100, `Full Name must be at most 100 characters`),
    ...(isDev()
        ? {
              password: z.string().required(`Password is Required`)
          }
        : {
              password: z
                  .string()
                  .required(`Password is Required`)
                  .min(8, `Password must be at least 8 characters`)
                  .max(100, `Password must be at most 100 characters`)
          })
});

export default function AccountCreationComponent({
    ruri,
    isLoading,
    setIsLoading,
    dwmsParam,
    refferalId,
    onContinue
}: {
    ruri?: string;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    dwmsParam?: string;
    refferalId?: string;
    onContinue: (data: RegisterRequestDataType) => void;
}) {
    const [initialValues, setInitialValues] = useState<RegisterUserData>({
        full_name: "",
        email: "",
        password: ""
    });
    const [dwmsData, setDWMSData] = useState<DWMSData>();
    const [isVisible, setVisible] = useState(false);
    const [isTncChecked, setTncChecked] = useState(false);

    const onGoogleLoginSuccess = (response: CredentialResponse) => {
        const idToken = response.credential;
        publicGateway
            .post("/api/v1/auth/signin-with-google/", { idToken })
            .then(res => {
                if (res.status !== 200) {
                    toast.error("Google login failed");
                    return;
                }
                const tokens = res.data.response;
                localStorage.setItem("accessToken", tokens.accessToken);
                localStorage.setItem("refreshToken", tokens.refreshToken);
                toast.success("Google login successful");
                onContinue({
                    is_provider_auth: true,
                    user: {
                        full_name: "",
                        email: "",
                        password: ""
                    },
                    interests: {
                        choosen_interests: [],
                        choosen_endgoals: [],
                        other_interests: [],
                        other_endgoals: []
                    }
                });
            })
            .catch(err => {
                toast.error("Google login failed");
            });
    };

    const onGoogleLoginError = () => {
        toast.error("Google login failed");
    };
    const onSubmit = (values: any) => {
        if (!isTncChecked) {
            toast.error("Please accept the terms and conditions");
            return;
        }
        const userData: RegisterRequestDataType = {
            is_provider_auth: false,
            user: {
                full_name: values.full_name,
                email: values.email,
                password: values.password
            },
            interests: {
                choosen_interests: [],
                choosen_endgoals: [],
                other_interests: [],
                other_endgoals: []
            },
            integration: dwmsParam
                ? { param: dwmsParam, title: "DWMS" }
                : undefined,
            referral: refferalId ? { muid: refferalId } : undefined
        };
        onContinue(userData);
    };

    useEffect(() => {
        if (isLoading) return;
        setIsLoading(true);
        if (dwmsParam) {
            getDWMSDetails(dwmsParam, (data: any) => {
                setDWMSData({
                    email: data?.email_id || "",
                    fullName:
                        data?.job_seeker_fname + " " + data?.job_seeker_lname ||
                        "",
                    phoneNumber: data?.mobile_no || "",
                    gender: data?.gender || "",
                    dob: data?.dob || ""
                });

                setInitialValues({
                    ...initialValues,
                    email: data?.email_id || "",
                    full_name:
                        data?.job_seeker_fname + " " + data?.job_seeker_lname ||
                        ""
                });
            });
        }

        setIsLoading(false);
    }, []);

    return (
        <OnboardingTemplate>
            <OnboardingHeader
                title={"Create an Account"}
                desc={"Please Enter Your Information"}
            />
            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                validationSchema={scheme}
                onSubmit={onSubmit}
            >
                {formik => (
                    <Form>
                        <div className={styles.accountCreationContainer}>
                            <div className={styles.accountCreationInputs}>
                                <div className={styles.inputBox}>
                                    <GoogleLogin
                                        onSuccess={onGoogleLoginSuccess}
                                        onError={onGoogleLoginError}
                                    />
                                    <h1 className={styles.orSeperator}>
                                        <span></span>
                                        <p>OR</p>
                                        <span></span>
                                    </h1>
                                    <SimpleInput
                                        name={"email"}
                                        type="email"
                                        value={
                                            formik.values.email ||
                                            dwmsData?.email
                                        }
                                        onChange={formik.handleChange}
                                        placeholder="Email id"
                                        required
                                        disabled={
                                            isLoading || dwmsData?.email
                                                ? true
                                                : false
                                        }
                                        style={
                                            dwmsData?.email
                                                ? { backgroundColor: "#f7f7f7" }
                                                : { backgroundColor: "#F5F7FB" }
                                        }
                                    />
                                </div>

                                <div className={styles.accountCreationName}>
                                    <div className={styles.inputBox}>
                                        <SimpleInput
                                            name={"full_name"}
                                            onChange={formik.handleChange}
                                            type="text"
                                            placeholder="Full Name"
                                            value={
                                                formik.values.full_name ||
                                                dwmsData?.fullName
                                            }
                                            required
                                            disabled={
                                                isLoading || dwmsData?.fullName
                                                    ? true
                                                    : false
                                            }
                                            style={
                                                dwmsData?.fullName
                                                    ? {
                                                          backgroundColor:
                                                              "#f7f7f7"
                                                      }
                                                    : {
                                                          backgroundColor:
                                                              "#F5F7FB"
                                                      }
                                            }
                                        />
                                    </div>
                                    <div
                                        className={
                                            styles.accountCreationPassword
                                        }
                                    >
                                        <div className={styles.inputBox}>
                                            <SimpleInput
                                                name={"password"}
                                                value={formik.values.password}
                                                onChange={formik.handleChange}
                                                type={
                                                    isVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Password"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setVisible(e => !e)}
                                        >
                                            {isVisible ? (
                                                <HiEye size={26} />
                                            ) : (
                                                <HiEyeSlash size={26} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.tnc}>
                                    <input
                                        type="checkbox"
                                        name="tnc"
                                        className={styles.tncCheckbox}
                                        checked={isTncChecked}
                                        onChange={() => setTncChecked(e => !e)}
                                    />

                                    <p>
                                        I agree to the{" "}
                                        <a
                                            href="http://mulearn.org/termsandconditions"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Terms & Conditions
                                        </a>
                                        {" and "}
                                        <a
                                            href="http://mulearn.org/privacypolicy"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Privacy Policy
                                        </a>
                                    </p>
                                </div>
                                <div className={styles.supportContainer}>
                                    <BiSupport size={20} />
                                    <a
                                        href="https://chat.whatsapp.com/La3nY4AVQsR0ndrwk4wN7v"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <p className={styles.supportWa}>
                                            Facing Issues? Join our{" "}
                                            <span>Support Group!</span>
                                        </p>
                                    </a>
                                </div>

                                <PowerfulButton
                                    type="submit"
                                    style={{ marginTop: "10px" }}
                                    isLoading={isLoading}
                                >
                                    {isLoading ? "Validating..." : "Register"}
                                </PowerfulButton>
                            </div>

                            <div className={styles.accountCreationAlternative}>
                                <div>
                                    <p>
                                        Already have an account?{" "}
                                        <a
                                            href={
                                                ruri
                                                    ? `/login?ruri=${ruri}`
                                                    : "/login"
                                            }
                                        >
                                            Sign In
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </OnboardingTemplate>
    );
}
