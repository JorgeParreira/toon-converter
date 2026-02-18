import { useEffect, useState } from "react";


function ApiPlayground() {


    const [endpoint, setEndpoint] = useState("json-to-toon");
    const [body, setBody] = useState("");
    const [response, setResponse] = useState("");

    useEffect(() => { console.log("Selected endpoint:", endpoint); }, [endpoint]);  


const handleSendToAPI = () => { 

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.parse(body);

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: JSON.stringify(raw),
  redirect: "follow"
};

fetch(`https://api.toon-converter.workers.dev/${endpoint}`, requestOptions)
  .then((response) => response.text())
  .then((result) => setResponse(result))
  .catch((error) => console.error(error));

}


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4">

        {/* URL + endpoint */}
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value="https://api.toon-converter.workers.dev/"
            readOnly
            className="flex-1 p-2 rounded bg-slate-700 text-white text-sm"
          />

          <select
            name="api-endpoint"
            id="api-endpoint"
            className="w-48 p-2 rounded bg-slate-700 text-white text-sm"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          >
            <option value="json-to-toon">json-to-toon</option>
            <option value="toon-to-json">toon-to-json</option>
          </select>
        </div>

        {/* Input */}
        <textarea
          className="w-full h-64 p-4 rounded bg-slate-700 text-white text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter JSON or TOON here..."
        />
         {/* Output */}
        <div className="mt-4 p-4 bg-slate-700 rounded text-white text-sm h-32 overflow-auto">
          {response || "API response will appear here..."}
        </div>

        {/* Button */}
        <button onClick={handleSendToAPI} className=" px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Send to API
        </button>

      </div>
    </div>
  );
}

export default ApiPlayground;