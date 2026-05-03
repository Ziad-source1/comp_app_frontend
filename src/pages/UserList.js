import { useEffect, useState } from "react";
import axios from "axios";
function UserList() {
    const [users,setUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/users')
        .then(response => {
            console.log(response.data); //  check what your API returns
            setUsers(response.data);
        })
        .catch(err => console.log(err));
    }, []);

    return (
        <div>
            <h2>ALL USERS</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.username} - {user.email} - {user.role}</li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;




