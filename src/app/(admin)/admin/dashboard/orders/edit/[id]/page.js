import OrderCard from "../Compo";


export default async function EditPage({ params }) {

    const par = await params;
  const editId =  par?.id;

    console.log(editId, "id editing")

  return (
      <div className="w-full flex justify-center items-center">
      <OrderCard editId={editId} />
      </div>
  );
}
