import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [users, setUsers] = useState({});
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
  });

  // Fetch user details for each conversation
  useEffect(() => {
    if (data && data.length > 0) {
      const fetchUsers = async () => {
        const userMap = {};

        for (const conversation of data) {
          const userId = currentUser.isSeller
            ? conversation.buyerId
            : conversation.sellerId;

          if (!userMap[userId]) {
            try {
              const res = await newRequest.get(`/users/${userId}`);
              userMap[userId] = res.data;
            } catch (err) {
              console.error(`Error fetching user ${userId}:`, err);
              userMap[userId] = { username: "Unknown User" };
            }
          }
        }

        setUsers(userMap);
      };

      fetchUsers();
    }
  }, [data, currentUser]);

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  const getDisplayName = (userId) => {
    return users[userId]?.username || "Loading...";
  };

  return (
    <div className="messages">
      {isLoading ? (
        <div className="loading">Loading your conversations...</div>
      ) : error ? (
        <div className="error">
          Error loading conversations. Please try again.
        </div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
          </div>
          {data.length === 0 ? (
            <div className="no-messages">
              <p>You don't have any messages yet.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{currentUser.isSeller ? "Buyer" : "Seller"}</th>
                  <th>Last Message</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => {
                  const otherUserId = currentUser.isSeller
                    ? c.buyerId
                    : c.sellerId;
                  const isUnread =
                    (currentUser.isSeller && !c.readBySeller) ||
                    (!currentUser.isSeller && !c.readByBuyer);

                  return (
                    <tr className={isUnread ? "active" : ""} key={c.id}>
                      <td>{getDisplayName(otherUserId)}</td>
                      <td>
                        <Link to={`/message/${c.id}`} className="link">
                          {c?.lastMessage
                            ? c.lastMessage.length > 100
                              ? `${c.lastMessage.substring(0, 100)}...`
                              : c.lastMessage
                            : "No messages yet"}
                        </Link>
                      </td>
                      <td>{moment(c.updatedAt).fromNow()}</td>
                      <td>
                        {isUnread && (
                          <button onClick={() => handleRead(c.id)}>
                            Mark as Read
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;
