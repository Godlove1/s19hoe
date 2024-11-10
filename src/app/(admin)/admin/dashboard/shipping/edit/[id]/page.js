import Compo from "../compo";


export default async function EditPage({ params }) {
  const par = await params;
  const editId = par?.id;

  console.log(editId, "id editing");

  return (
    <>
      <Compo editId={editId} />
    </>
  );
}
