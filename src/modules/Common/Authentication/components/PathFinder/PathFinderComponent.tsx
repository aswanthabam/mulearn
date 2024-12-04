import React, { useState, useEffect } from "react";
import OnboardingTemplate from "../OnboardingTeamplate/OnboardingTemplate";
import styles from "./PathFinderComponent.module.css";
import { PowerfulButton } from "@/MuLearnComponents/MuButtons/MuButton";
import { Button, Checkbox, Progress } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { BiChevronRight, BiRightArrow, BiRocket } from "react-icons/bi";
import { originalQuestions } from "./questions";
import {
    Link,
    useLocation,
    useNavigate,
    useSearchParams
} from "react-router-dom";
import quizImg from "../../assets/quiz.png";
import exploreImg from "../../assets/explore.png";

const shuffleQuestions = (questions: Question[]): Question[] => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export default function PathFinderComponent({
    onContinue
}: {
    onContinue: (interests: string[]) => void;
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [scores, setScores] = useState<Record<"A" | "B" | "C" | "D", number>>(
        {
            A: 0,
            B: 0,
            C: 0,
            D: 0
        }
    );
    const [selectedOptions, setSelectedOptions] = useState<
        Record<number, string[]>
    >({});
    const [questions, setQuestions] = useState<Question[]>([]);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const ruri = searchParams.get("ruri");
    useEffect(() => {
        setQuestions(shuffleQuestions(originalQuestions));
    }, []);
    const location = useLocation();

    const handleNextQuestion = () => {
        const updatedScores = { ...scores };
        (selectedOptions[currentQuestionIndex] ?? []).forEach(category => {
            updatedScores[category as "A" | "B" | "C" | "D"] += 1;
        });
        setScores(updatedScores);

        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            console.log("getRecommendedPathways", getRecommendedPathways());
            onContinue(getRecommendedPathways());
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleOptionChange = (category: string) => {
        setSelectedOptions(prevSelectedOptions => {
            const updatedOptions = [
                ...(prevSelectedOptions[currentQuestionIndex] || [])
            ];
            if (updatedOptions.includes(category)) {
                const index = updatedOptions.indexOf(category);
                updatedOptions.splice(index, 1); // Remove category
            } else {
                updatedOptions.push(category); // Add category
            }
            return {
                ...prevSelectedOptions,
                [currentQuestionIndex]: updatedOptions
            };
        });
    };

    const getRecommendedPathways = () => {
        const pathways = [];
        if (scores.A > 2) pathways.push("hardware");
        if (scores.B > 2) pathways.push("coder");
        if (scores.C > 2) pathways.push("creative");
        if (scores.D > 2) pathways.push("others");
        return pathways;
    };

    return (
        <OnboardingTemplate>
            <div className={styles.pathFinderContainer}>
                {/* {currentQuestionIndex < 0 ? (
                    <div className={styles.initialBoxes}>
                        <div
                            className={`${styles.initialBox}`}
                            onClick={() =>
                                navigate(
                                    ruri
                                        ? "/register/interests?ruri=" + ruri
                                        : "/register/interests?ruri=noredirect"
                                )
                            }
                        >
                            <img
                                src={exploreImg}
                                alt="Explore"
                                className={styles.boxImage}
                            />
                            <h4>Know what your interest is?</h4>
                            <span>Get started by selecting your interests</span>
                            <PowerfulButton>
                                Select Interests <BiRightArrow />
                            </PowerfulButton>
                        </div>
                        <div
                            className={`${styles.initialBox}`}
                            onClick={() => setCurrentQuestionIndex(0)}
                        >
                            <img
                                src={quizImg}
                                alt="Quiz"
                                className={styles.boxImage}
                            />
                            <h4>Not sure what to choose?</h4>
                            <span>
                                Take a quick quiz to find out what interests you
                            </span>
                            <PowerfulButton>
                                Start Quiz <BiRightArrow />
                            </PowerfulButton>
                        </div>
                    </div>
                ) : ( */}
                <div className={styles.questionBox}>
                    {questions[currentQuestionIndex] && (
                        <>
                            <span className={styles.status}>
                                Question {currentQuestionIndex + 1} of{" "}
                                {questions.length}
                            </span>
                            <Progress
                                value={
                                    ((currentQuestionIndex + 1) /
                                        questions.length) *
                                    100
                                }
                                colorScheme="blue"
                                rounded={10}
                                size="sm"
                                className={styles.progress}
                            />
                            <h4 className={styles.question}>
                                {questions[currentQuestionIndex].question}
                            </h4>
                            <table className={styles.optionsTable}>
                                <tbody>
                                    {questions[
                                        currentQuestionIndex
                                    ].options.map((option, index) => (
                                        <tr
                                            key={index}
                                            className={
                                                styles.option +
                                                " " +
                                                (selectedOptions[
                                                    currentQuestionIndex
                                                ]?.includes(option.category)
                                                    ? styles.selected
                                                    : "")
                                            }
                                            onClick={() =>
                                                handleOptionChange(
                                                    option.category
                                                )
                                            }
                                        >
                                            <td>
                                                <Checkbox
                                                    className={styles.checkbox}
                                                    value={option.category}
                                                    isChecked={
                                                        selectedOptions[
                                                            currentQuestionIndex
                                                        ]?.includes(
                                                            option.category
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        handleOptionChange(
                                                            option.category
                                                        )
                                                    }
                                                />
                                                {option.text}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className={styles.actionButtons}>
                                <PowerfulButton
                                    style={{
                                        gap: 10,
                                        width: "fit-content"
                                    }}
                                    onClick={handleNextQuestion}
                                >
                                    {!selectedOptions[currentQuestionIndex] ||
                                    selectedOptions[currentQuestionIndex]
                                        .length === 0
                                        ? "Skip to next question"
                                        : currentQuestionIndex + 1 <
                                          questions.length
                                        ? "Continue"
                                        : "Find your interest"}{" "}
                                    {currentQuestionIndex + 1 <
                                    questions.length ? (
                                        <BiChevronRight size={25} />
                                    ) : (
                                        <BiRocket size={20} />
                                    )}
                                </PowerfulButton>
                                <Link
                                    to={
                                        ruri
                                            ? "/register/interests?ruri=" + ruri
                                            : "/register/interests"
                                    }
                                    className={styles.skiptointerests}
                                >
                                    Know what your interest is?{" "}
                                    <span
                                        style={{
                                            fontSize: "inherit",
                                            color: "blueviolet"
                                        }}
                                    >
                                        Skip and select your interests
                                    </span>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
                {/* )} */}
            </div>
        </OnboardingTemplate>
    );
}
