import Link from 'next/link'

export default function HowItWorks() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl my-12">
      <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
        ¿Cómo funciona?
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Organizá partidos en 3 simples pasos
      </p>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="text-center group">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-4xl">⚽</span>
          </div>
          <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
            PASO 1
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Creá tu partido</h3>
          <p className="text-gray-600">
            Elegí deporte, fecha, hora y lugar. En menos de un minuto tu partido está listo.
          </p>
        </div>

        {/* Step 2 */}
        <div className="text-center group">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-4xl">📲</span>
          </div>
          <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
            PASO 2
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Compartí el link</h3>
          <p className="text-gray-600">
            Invitá a tus amigos por WhatsApp o dejalo público para que se sumen jugadores.
          </p>
        </div>

        {/* Step 3 */}
        <div className="text-center group">
          <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-4xl">🏆</span>
          </div>
          <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
            PASO 3
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¡A jugar!</h3>
          <p className="text-gray-600">
            Todos confirmados, partido listo. Coordiná los detalles y disfrutá del juego.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <Link
          href="/matches/new"
          className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Crear mi primer partido
        </Link>
      </div>
    </div>
  )
}
