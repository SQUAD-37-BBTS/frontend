import { Link } from "react-router"

export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <Link to="/">Voltar para o início</Link>
    </div>
  )
}
