// /src/app/components/header.js

export default function Header() {
  return (
    <div className="bg-gray-100 flex justify-between items-center p-1.5 shadow-2xs">
      <div>
        <h1 className="font-bold text-2xl">Codecord</h1>
      </div>

      <div>
        <p>View Profile</p> {/* Turn this into a Link or Button later*/}
      </div>
    </div>
  );
}
