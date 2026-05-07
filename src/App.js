
import './App.css';
import KendoGrid from './Kendo';
import { useEffect, useState } from "react";

function App() {
	
	  const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("http://10.66.48.80:3000/api/users")
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error("Error:", error));
    }, []);
			
  return (
    <div className="App">
     <KendoGrid data={users}/>

    </div>
  );
}

export default App;
