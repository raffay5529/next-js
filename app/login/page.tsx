
import Login from "./login"

export default function Page() {

  return (
     <div className="bg-white min-h-screen">
          <main>
          <section className="container mx-auto  flex flex-col items-center gap-10 p-3">
            <h1 className="text-black text-6xl ">Login  </h1>
           <Login/>
           
          </section>
     
          
         </main>
        </div>
  
  )
}
