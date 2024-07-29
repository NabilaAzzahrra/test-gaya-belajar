import { useState, useEffect } from "react";
import axios from "axios";
import questionImage from "../assets/img/question.json";
import Lottie from "lottie-react";
import { checkTokenExpiration } from "../middlewares/middleware";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({});

  const navigate = useNavigate();

  const getUser = async () => {
    checkTokenExpiration()
      .then((response) => {
        console.log(response);
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const userName = decoded.name;
        const userEmail = decoded.email;
        const userPhone = decoded.phone;
        const userStatus = decoded.status;
        const userClass = decoded.class;
        const userSchool = decoded.school;
        const data = {
          id: userId,
          name: userName,
          email: userEmail,
          phone: userPhone,
          status: userStatus,
          class: userClass,
          school: userSchool,
        };
        console.log(data);
        setUser(data);
        getResult(data);
      })
      .catch((error) => {
        console.log(error);
        navigate("/");
      });
  };

  const getResult = async (data) => {
    console.log(data);
    await axios
      .get(
        `https://api.politekniklp3i-tasikmalaya.ac.id/gayabelajar/hasils/${data.id}`
      )
      .then((response) => {
        const data = response.data;
        if (data.length > 0) {
          navigate("/result");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getQuestions = async () => {
    checkTokenExpiration()
      .then(async () => {
        await axios
          .get(
            "https://api.politekniklp3i-tasikmalaya.ac.id/gayabelajar/questions"
          )
          .then((response) => {
            setQuestions(response.data);
          })
          .catch((error) => {
            console.log(error);
            navigate("/");
          });
      })
      .catch((error) => {
        console.log(error);
        navigate("/");
      });
  };

  useEffect(() => {
    checkTokenExpiration()
      .then(() => {
        getUser();
        getQuestions();
        bucketQuestion();
      })
      .catch((error) => {
        console.log(error);
        navigate("/");
      });
  }, []);

  useEffect(() => {
    const bucket = localStorage.getItem("bucket");
    if (bucket) {
      const parsedData = JSON.parse(bucket);
      if (parsedData.length > 0) {
        const lastData = parsedData[parsedData.length - 1];
        setCurrentQuestion(lastData.question);
      }
    }
  }, [questions]);

  const bucketQuestion = () => {
    let bucket = localStorage.getItem("bucket") || "[]";
    bucket = JSON.parse(bucket);
    if (bucket.length > 0) {
      const lastData = bucket[bucket.length - 1];
      setSelectedOption(lastData.answer);
    }
  };

  const handleOptionSelect = (event) => {
    handleNextQuestion(event.target.value);
  };

  const handleNextQuestion = (answer) => {
    setActive(parseInt(answer));
    let bucket = localStorage.getItem("bucket") || "[]";
    const questionLength = questions.length;
    bucket = JSON.parse(bucket);
    if (currentQuestion + 1 === questionLength) {
      handleFinish(answer);
    } else {
      let data = {
        question: currentQuestion + 1,
        id_question: questions[currentQuestion].id,
        options: answer,
        user_id: user.id,
        nama: user.name,
        kelas: user.class,
        phone: user.phone,
        sekolah: user.school,
      };
      bucket.push(data);
      localStorage.setItem("bucket", JSON.stringify(bucket));
      setSelectedOption(null);
      setCurrentQuestion(currentQuestion + 1);
      setTimeout(() => {
        setLoading(false);
        setActive(0);
      }, 3000);
    }
  };

  const handleFinish = async (answer) => {
    setLoading(true);
    let bucket = localStorage.getItem("bucket") || "[]";
    bucket = JSON.parse(bucket);
    let data = {
      question: currentQuestion + 1,
      id_question: questions[currentQuestion].id,
      options: answer,
      user_id: user.id,
      nama: user.name,
      kelas: user.class,
      phone: user.phone,
      sekolah: user.school,
    };
    bucket.push(data);
    localStorage.setItem("bucket", JSON.stringify(bucket));

    await axios
      .post("https://api.politekniklp3i-tasikmalaya.ac.id/gayabelajar/tests", {
        answers: bucket,
      })
      .then(() => {
        localStorage.removeItem("bucket");
        setTimeout(() => {
          setLoading(false);
          setActive(0);
          navigate("/result");
        }, 100);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <main className="flex flex-col justify-between h-screen">
      <header className="bg-black p-3 py-8">
        <h2 className="text-md md:text-2xl font-bold text-white text-center">
          TES GAYA BELAJAR
        </h2>
      </header>
      {loading && (
        <div className="fixed inset-0 bg-white flex justify-center items-center">
          <p>LOADING.....</p>
        </div>
      )}
      <section className="flex flex-col justify-center items-center gap-5">
        <div className="max-w-5xl space-y-1 md:space-y-5">
          <div className="text-md font-bold rounded-3xl flex justify-center">
            <div className="flex items-center">
              <Lottie
                animationData={questionImage}
                loop={true}
                className="h-40"
              />
              QUESTION {currentQuestion + 1} / {questions.length}
            </div>
          </div>
          <div className="bg-gray-100 p-4 mx-5 rounded-xl">
            <p className="text-center text-gray-900">
              {questions[currentQuestion]?.questions}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-center gap-5 md:gap-10 p-4">
            {questions[currentQuestion]?.details.map((detail) => (
              <label key={detail.id}>
                <input
                  type="radio"
                  name="option"
                  value={detail.options}
                  onClick={handleOptionSelect}
                  className="hidden"
                  checked={selectedOption === 1}
                  readOnly
                />
                <div
                  className={`flex text-[15px] justify-center hover:bg-black hover:text-white ${
                    active == 4
                      ? "bg-black text-white"
                      : "bg-white text-gray-900"
                  }"
                 px-4 py-2 cursor-pointer text-center flex items-center gap-2 rounded-full border-2 border-black`}
                >
                  {detail.value_option}
                </div>
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-center text-gray-500 px-6 xl:text-md">
              © A Chapman and V Chislett MSc 2005, diambil dari{" "}
              <span className="italic">
                Gardner's Multiple Intelligences Model
              </span>
              . From <span className="italic">www.businessballs.com</span>{" "}
              dengan item yang telah dimodifikasi. Tidak untuk dijual dan
              dicetak. Penulis tidak bertanggung-jawab atas pelanggaran hal-hal
              tersebut.
            </p>
          </div>
        </div>
      </section>
      <footer>
        <marquee className="text-xs text-gray-500">
          Tidak ada jawaban 'benar' atau 'salah' disini, jadilah dirimu sendiri
          ketika mengisi jawaban
        </marquee>
      </footer>
    </main>
  );
}

export default Questions;
