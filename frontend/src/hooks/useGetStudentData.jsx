import React, { useEffect } from 'react';
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setStudentData } from '../redux/studentSlice'; // Assuming a slice to store student data
import { BASE_URL } from '../main';

const useGetStudentData = () => {
    const { selectedUser } = useSelector(store => store.user);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                axios.defaults.withCredentials = true;
                const res = await axios.get(`${BASE_URL}/api/v1/student/${selectedUser?._id}`);
                dispatch(setStudentData(res.data)); // Dispatching fetched student data
            } catch (error) {
                console.log(error);
            }
        }

        if (selectedUser?._id) {
            fetchStudentData();
        }
    }, [selectedUser?._id, dispatch]);
}

export default useGetStudentData;
