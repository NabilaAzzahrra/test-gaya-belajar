import { jwtDecode } from "jwt-decode";

const checkTokenExpiration = () => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const token = localStorage.getItem('LP3ITGB:token');
    if (!token || typeof token !== 'string') {
      reject({
        forbidden: true,
        message: 'Token tidak valid',
        data: null
      });
      return;
    }
    const decoded = jwtDecode(token);
    const expirationTimeMillis = decoded.exp * 1000;
    if (now >= expirationTimeMillis) {
      localStorage.removeItem('LP3ITGB:token');
      resolve({
        forbidden: true,
        message: 'Token kadaluwarsa',
        data: null
      });
    } else {
      resolve({
        forbidden: false,
        message: 'Token berlaku!',
        data: decoded
      });
    }
  })
}

export { checkTokenExpiration };