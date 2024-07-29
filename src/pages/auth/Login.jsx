import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoLp3i from '../../assets/img/logo-lp3i.png'
import logoTagline from '../../assets/img/tagline-warna.png'
import { checkTokenExpiration, forbiddenAccess } from '../../middlewares/middleware';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const loginFunc = async (e) => {
        e.preventDefault();
        await axios.post(`https://database.politekniklp3i-tasikmalaya.ac.id/api/auth/psikotest/login`, {
            email: email,
            password: password
        })
            .then((response) => {
                console.log(response.data);
                localStorage.setItem('token', response.data.access_token)
                alert(response.data.message)
                navigate('/home')
            })
            .catch((error) => {
                if (error.response.status == 401) {
                    return alert(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
    }

    useEffect(() => {
        checkTokenExpiration()
        .then(() => {
            window.history.back();
        })
        .catch((error) => {
            console.log(error);
        });
        forbiddenAccess()
        .then((response)=> {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });
    }, []);

    return (
        <section className='bg-gray-50 h-screen flex justify-center items-center bg-cover'>
            <main className='container mx-auto space-y-8 px-5'>
                <div className='max-w-md mx-auto flex justify-center gap-5'>
                    <img src={logoLp3i} alt='logo lp3i' className='h-14' />
                    <img src={logoTagline} alt='logo lp3i' className='h-12' />
                </div>
                <form className="max-w-md bg-white border border-gray-100 shadow-lg mx-auto px-8 py-8 rounded-3xl" onSubmit={loginFunc}>
                    <div className="mb-5">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 border font-reguler border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="name@email.com" required />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
                    </div>
                    <div className='space-x-3'>
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-reguler rounded-xl text-sm w-full sm:w-auto px-5 py-2.5 text-center">Masuk</button>
                        <a href={`/register`} className='text-sm text-gray-700 hover:underline'>
                            <span>Belum punya akun? </span>
                            <span className='font-medium'>Daftar disini</span>
                        </a>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default Login
