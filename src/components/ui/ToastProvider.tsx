'use client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * react-toastify를 사용하기 위한 ToastContainer를 렌더링합니다.
 * 이 컴포넌트는 애플리케이션의 최상위 레이아웃에 한 번만 포함되어야 합니다.
 * 토스트를 표시하려면 showToast 유틸리티 함수를 사용하세요.
 * 
 * @returns {JSX.Element} ToastContainer 컴포넌트
 */
export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={1500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
}
