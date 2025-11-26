import Lottie from 'lottie-react';

function LottiePlayer({ animationData, width = 200, height = 200 }) {
  return (
    <div style={{ width, height }}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
}

export default LottiePlayer;
