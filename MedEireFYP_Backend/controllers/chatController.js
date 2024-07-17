import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getChatByID = async (senderID, receiverID) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { senderID: senderID, receiverID: receiverID },
          { senderID: receiverID, receiverID: senderID },
        ],
      },
      include: {
        messages: {
          select: {
            message: true,
            messageID: true,
            senderID: true,
            dateCreate: true,
            chatID: true,
          },
        },
      },
    });

    if (chats.length > 0){
      return { chats: chats };
    }
    else {
      return false
    }
    
  } catch (error) {
    return { status: 500, msg: "ERROR CHAT", error };
  }

  // return getChatByID;
};

const createChat = async (message) => {
  const { senderID, receiverID } = message;
  message = message.message;

  const date = new Date();
  let newChat = "";

  try {
    const chatExist = await prisma.chat.findMany({
      where: {
        OR: [
          { senderID: senderID, receiverID: receiverID },
          { senderID: receiverID, receiverID: senderID },
        ],
      },
    });

    if (chatExist.length > 0) {
      newChat = await sendMessage(chatExist[0].chatID, senderID, message, date);
    } else {
      newChat = await prisma.chat.create({
        data: {
          senderID: senderID,
          receiverID: receiverID,
          messages: {
            create: {
              message: message,
              senderID: senderID,
              dateCreate: date,
            },
          },
        },
      });
    }
    return { status: 200, newChat };
  } catch (error) {
    console.log(error);
    return { status: 500, msg: "Error Chat" };
  }
};

const sendMessage = async (chatID, senderID, message, date) => {
  try {
    const Message = await prisma.message.create({
      data: {
        message: message,
        senderID: senderID,
        dateCreate: date,
        chatID: chatID,
      },
    });

    return Message;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export { getChatByID, createChat, sendMessage };
