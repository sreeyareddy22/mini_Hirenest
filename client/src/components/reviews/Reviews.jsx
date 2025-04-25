import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import "./Reviews.scss";
const Reviews = ({ gigId }) => {
  const [errorMsg, setErrorMsg] = useState("");
  const queryClient = useQueryClient()
  const { isLoading, error, data } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      newRequest.get(`/reviews/${gigId}`).then((res) => {
        return res.data;
      }),
  });

  const mutation = useMutation({
    mutationFn: (review) => {
      return newRequest.post("/reviews", review);
    },
    onSuccess:()=>{
      queryClient.invalidateQueries(["reviews"])
      setErrorMsg("");
    },
    onError: (error) => {
      setErrorMsg(error.response.data || "Something went wrong!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target.elements[0].value;
    const star = parseInt(e.target.elements[1].value);
    
    if (!desc.trim()) {
      setErrorMsg("Please write a review description");
      return;
    }
    
    mutation.mutate({ gigId, desc, star });
    
    // Clear form after submission
    e.target.reset();
  };

  return (
    <div className="reviews">
      <h2>Reviews</h2>
      {isLoading
        ? "loading"
        : error
        ? "Something went wrong!"
        : data.map((review) => <Review key={review._id} review={review} />)}
      <div className="add">
        <h3>Add a review</h3>
        {errorMsg && <div className="error-message">{errorMsg}</div>}
        <form action="" className="addForm" onSubmit={handleSubmit}>
          <input type="text" placeholder="write your opinion" />
          <select name="star">
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <button>Send</button>
        </form>
      </div>
    </div>
  );
};

export default Reviews;
