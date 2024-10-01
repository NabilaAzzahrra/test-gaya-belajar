import axios from 'axios'
import Lottie from 'lottie-react'
import { jwtDecode } from 'jwt-decode'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import questionImage from '../assets/img/question.json';

import ServerError from './errors/ServerError'
import LoadingScreen from './LoadingScreen'

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({});

  const [errorPage, setErrorPage] = useState(false);

  const navigate = useNavigate();

  const getInfo = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('LP3ITGB:token');
      if (!token) {
        return navigate('/');
      }

      const decoded = jwtDecode(token);
      setUser(decoded.data);

      const fetchProfile = async (token) => {
        const response = await axios.get('https://elearning.politekniklp3i-tasikmalaya.ac.id:8444/pmb/profiles/v1', {
          headers: { Authorization: token },
          withCredentials: true,
        });
        return response.data;
      };

      try {
        const profileData = await fetchProfile(token);
        const data = {
          id: decoded.data.id,
          name: profileData.applicant.name,
          email: profileData.applicant.email,
          phone: profileData.applicant.phone,
          school: profileData.applicant.school,
          class: profileData.applicant.class,
          status: decoded.data.status,
        };
        setUser(data);
        getResult(data);
      } catch (profileError) {
        if (profileError.response && profileError.response.status === 403) {
          try {
            const response = await axios.get('https://elearning.politekniklp3i-tasikmalaya.ac.id:8444/pmb/auth/token/v2', {
              withCredentials: true,
            });

            const newToken = response.data;
            const decodedNewToken = jwtDecode(newToken);
            localStorage.setItem('LP3ITGB:token', newToken);
            setUser(decodedNewToken.data);
            const newProfileData = await fetchProfile(newToken);
            const data = {
              id: decodedNewToken.data.id,
              name: newProfileData.applicant.name,
              email: newProfileData.applicant.email,
              phone: newProfileData.applicant.phone,
              school: newProfileData.applicant.school,
              class: newProfileData.applicant.class,
              status: decodedNewToken.data.status,
            };
            setUser(data);
            getResult(data);
          } catch (error) {
            console.error('Error refreshing token or fetching profile:', error);
            if (error.response && error.response.status === 400) {
              localStorage.removeItem('LP3ITGB:token');
              navigate('/');
            }
          }
        } else {
          console.error('Error fetching profile:', profileError);
          localStorage.removeItem('LP3ITGB:token');
          setErrorPage(true);
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      }
    } catch (error) {
      if (error.response) {
        if ([400, 403].includes(error.response.status)) {
          localStorage.removeItem('LP3ITGB:token');
          navigate('/');
        } else {
          console.error('Unexpected HTTP error:', error);
          setErrorPage(true);
        }
      } else if (error.request) {
        console.error('Network error:', error);
        setErrorPage(true);
      } else {
        console.error('Error:', error);
        setErrorPage(true);
      }
      navigate('/');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const getResult = async (data) => {
    await axios
      .get(
        `https://elearning.politekniklp3i-tasikmalaya.ac.id:8444/gayabelajar/hasils/${data.id}`
      )
      .then((response) => {
        const data = response.data;
        if (data) {
          navigate("/result");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getQuestions = async () => {
    await axios
      .get(
        "https://elearning.politekniklp3i-tasikmalaya.ac.id:8444/gayabelajar/questions"
      )
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
    setLoading(true);
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
      }, 1000);
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
      .post("https://elearning.politekniklp3i-tasikmalaya.ac.id:8444/gayabelajar/tests", {
        answers: bucket,
      })
      .then(() => {
        localStorage.removeItem("bucket");
        setTimeout(() => {
          setLoading(false);
          setActive(0);
          navigate("/result");
        }, 1000);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getInfo();
    getQuestions();
    bucketQuestion();
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

  return (
    errorPage ? (
      <ServerError />
    ) : (
      loading ? (
        <LoadingScreen />
      ) : (
        <section className="flex flex-col justify-between h-screen">
          <header className="bg-black p-3 py-8">
            <h2 className="text-md md:text-2xl font-bold text-white text-center">
              TES GAYA BELAJAR
            </h2>
          </header>
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
                      className={`flex text-[15px] justify-center hover:bg-black hover:text-white ${active == 4
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
        </section>
      )
    )
  );
}

export default Questions;
