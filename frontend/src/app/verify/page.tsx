import { Suspense } from "react";
import VerifyOtp from "../components/verifyOtp"
import Loading from "../components/loading";

const VerifyPage = () => {
  return (
    <Suspense fallback={<Loading/>}><VerifyOtp/></Suspense>
  );
};

export default VerifyPage;
