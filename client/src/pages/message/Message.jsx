import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [otherUser, setOtherUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const {
    isLoading: messagesLoading,
    error: messagesError,
    data: messages,
  } = useQuery({
    queryKey: ["messages", id],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => {
        return res.data;
      }),
  });

  // Fetch conversation details to get the other user's ID
  const {
    isLoading: convLoading,
    error: convError,
    data: conversation,
  } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () =>
      newRequest.get(`/conversations/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  // Determine the other user's ID
  useEffect(() => {
    if (conversation) {
      const otherUserId = currentUser.isSeller
        ? conversation.buyerId
        : conversation.sellerId;

      // Fetch user details
      const fetchUser = async () => {
        try {
          const res = await newRequest.get(`/users/${otherUserId}`);
          setOtherUser(res.data);
        } catch (err) {
          console.error("Error fetching user details:", err);
        }
      };

      fetchUser();
    }
  }, [conversation, currentUser]);

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", id]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const messageText = e.target[0].value.trim();
    if (!messageText) return;

    mutation.mutate({
      conversationId: id,
      desc: messageText,
    });
    e.target[0].value = "";
  };

  const isLoading = messagesLoading || convLoading;
  const error = messagesError || convError;

  return (
    <div className="message">
      <div className="container">
        <span className="breadcrumbs">
          <Link to="/messages">Messages</Link> {" > "}
          {otherUser ? otherUser.username : "Loading..."}
        </span>
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">Error loading messages. Please try again.</div>
        ) : (
          <div className="messages">
            {messages.map((m) => (
              <div
                className={m.userId === currentUser._id ? "owner item" : "item"}
                key={m._id}>
                <img
                  src={
                    m.userId === currentUser._id
                      ? currentUser.img || "/img/noavatar.jpg"
                      : otherUser?.img || "/img/noavatar.jpg"
                  }
                  alt="Profile"
                />
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        )}
        <hr />
        <form className="write" onSubmit={handleSubmit}>
          <textarea type="text" placeholder="Write a message..." />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Message;
