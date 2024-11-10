import '../loading.css'

export default function Loading() {
    return ( 
      <>
        <div className="w-full min-h-screen flex justify-center items-center">
          <div className="wrapper  w-[300px] max-w-sm  p-3 flex justify-center items-center flex-col bg-white">
            <p className="text-xl text-green-600">Loading...</p>
            <div className="loader mt-12"></div>
          </div>
        </div>
      </>
    );
}
