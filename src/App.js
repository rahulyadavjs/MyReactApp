import logo from './logo.svg';
import './App.css';
import Test from './test1';
import KendoGrid from './Kendo';
import { useEffect, useState } from "react";

function App() {
	var model=[{
		Id:1,
		Name:"Rahul"	
	},
	{
		Id:2,
		Name:"Ashish"
	}];
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
