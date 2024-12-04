import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { submitUserData } from "../../../services/newOnboardingApis";
import toast from "react-hot-toast";
import UserInterestSelectionComponent from "../../../components/UserInterest/UserInterestComponent";
import PathFinderComponent from "../../../components/PathFinder/PathFinderComponent";
import AccountCreationComponent from "../../../components/AccountCreation/AccountCreationComponent";
import OnboardingTemplate from "../../../components/OnboardingTeamplate/OnboardingTemplate";
import { INITIAL_ENDGOALS, INITIAL_INTERESTS } from "../constants";
import { privateGateway } from "@/MuLearnServices/apiGateways";
import { onboardingRoutes } from "@/MuLearnServices/urls";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const param = searchParams.get("param");
    const referralId = searchParams.get("referral_id");
    const ruri = searchParams.get("ruri");
    const interests = (searchParams.get("interests")?.split(",") ?? []).filter(
        i => i.length > 1
    );
    const endgoals = (searchParams.get("endgoals")?.split(",") ?? []).filter(
        i => i.length > 1
    );
    const [isLoading, setIsLoading] = useState(false);
    const [userInterest, setUserInterests] =
        useState<RegisterInterestData | null>(null);

    useEffect(() => {
        console.log("interests", interests);
        if (interests.length < 1) {
        } else if (endgoals.length < 1) {
            navigate(
                "/register/interests?" +
                    (ruri ? `ruri=${ruri}&` : "") +
                    "interests=" +
                    interests.join(",")
            );
        } else {
            var choosen_interests = interests.filter(interest =>
                INITIAL_INTERESTS.map(i => i.value).includes(interest)
            );
            var choosen_endgoals = endgoals.filter(endgoal =>
                INITIAL_ENDGOALS.map(i => i.value).includes(endgoal)
            );
            var other_endgoals = endgoals.filter(
                endgoal => !INITIAL_ENDGOALS.map(i => i.value).includes(endgoal)
            );
            var other_interests = interests.filter(
                interest =>
                    !INITIAL_INTERESTS.map(i => i.value).includes(interest)
            );
            setUserInterests({
                choosen_interests: choosen_interests,
                choosen_endgoals: choosen_endgoals,
                other_endgoals: other_endgoals,
                other_interests: other_interests
            });
        }
    }, []);

    const handlePathFinderOutput = (data: string[]) => {
        setSearchParams({ ...searchParams, interests: data.join(",") });
        navigate(
            "/register/interests?" +
                (ruri ? `ruri=${ruri}&` : "") +
                "interests=" +
                data.join(",")
        );
    };

    const handleAccountCreation = (userData: RegisterRequestDataType) => {
        if (!userInterest) {
            toast.error("Please select your interests and endgoals");
            navigate("/register/interests");
            return;
        }
        console.log("userData", userData);
        if (userData.is_provider_auth) {
            privateGateway
                .post(onboardingRoutes.interests, userInterest)
                .then(res => {
                    if (res.status === 200) {
                        navigate(
                            ruri
                                ? ruri == "noredirect"
                                    ? "/dashboard/profile"
                                    : `/register/organization/?ruri=${ruri}`
                                : "/register/organization"
                        );
                    } else {
                        toast.error(res.data?.message.general[0]);
                    }
                })
                .catch(err => {
                    navigate(
                        ruri
                            ? ruri == "noredirect"
                                ? "/dashboard/profile"
                                : `/register/organization/?ruri=${ruri}`
                            : "/register/organization"
                    );
                    toast.error(
                        err.response?.data.message.general[0] ||
                            "Unexpected Error occurred"
                    );
                });
            return;
        }
        userData.interests = userInterest;
        submitUserData({
            setIsLoading: setIsLoading,
            userData: userData
        }).then(res => {
            if (res) {
                navigate(
                    ruri
                        ? `/register/organization/?ruri=${ruri}`
                        : "/register/organization"
                );
            }
        });
    };

    if (!interests || interests.length < 1) {
        return <PathFinderComponent onContinue={handlePathFinderOutput} />;
    } else if (!endgoals || endgoals.length < 1) {
        var params = new URLSearchParams();
        params.append("interests", interests.join(","));
        params.append("ruri", ruri ?? "");
        navigate("/register/interests?" + params.toString());
        return null;
    } else {
        return (
            <AccountCreationComponent
                ruri={ruri ?? undefined}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                dwmsParam={param ?? undefined}
                refferalId={referralId ?? undefined}
                onContinue={handleAccountCreation}
            />
        );
    }
}
