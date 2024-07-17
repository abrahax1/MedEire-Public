export const sendRequest = async (url, reqOptions) => {
  try {
    const response = await fetch(url, reqOptions);
    const jsonResponse = await response.json();
    return { data: jsonResponse };
  } catch (error) {
    console.log(error);
    throw new Error(`server error, ${error}`);
  }
};

export const insertMessage = async (body) => {
  const token = localStorage.getItem("tokenAuthUser");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const id = body.senderId;

  let raw = JSON.stringify(body);

  let requestOptions = {
    method: "POST",
    headers: headers,
    body: raw,
    redirect: "follow",
  };

  console.log(requestOptions);

  const url = `https://med-eire.com/api/chat/${id}`;

  try {
    const response = await fetch(url, requestOptions);
    return response.status;
  } catch (error) {
    console.log(error);
    return 500;
  }
};
