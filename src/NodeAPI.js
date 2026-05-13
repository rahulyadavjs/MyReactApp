import { useEffect, useState } from "react";

export default function Test(props) {
	  const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("http://10.66.48.80:3000/api/users")
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error("Error:", error));
    }, []);
  return (
    <div className="App">
	{props.data.name} {props.data.email}
    </div>
	
  );
}

