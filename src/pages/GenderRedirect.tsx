import { Navigate, useParams } from "react-router-dom";

const GenderRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/categorias/${slug}`} replace />;
};

export default GenderRedirect;
