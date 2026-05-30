"use server"
import connectDB from "@/lib/db"
import { revalidatePath } from "next/cache";
import myColumns from "../myModels/myColumns";
import { KanBan } from "../myModels/mymodels.types";
import myCards from "../myModels/myCards";
import { Board } from "../models";
import mongoose from "mongoose";

export async function getColumns(boardId: string) {
  await connectDB()

  const result = await Board.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(boardId) } },
    {
      $lookup: {
        from: "mycolumns",
        localField: "columns",
        foreignField: "_id",
        as: "columns"
      }
    },
    { $project: { columns: 1, _id: 0 } }
  ])

  return JSON.parse(JSON.stringify(result[0]?.columns ?? []));
};

export async function getCards(columnIds: string[]) {
  await connectDB()
  const response = await myCards
    .find({ column: { $in: columnIds } })
    .sort({ order: 1 })
    .lean()
  return JSON.parse(JSON.stringify(response));
}

export async function createCard(data: KanBan, boardId: string) {
  try {
    await connectDB();
    const maxOrder = await myCards.findOne().sort({ order: -1 }).select("order").lean() as { order: number } | null;
    const newOrder = maxOrder ? maxOrder.order + 1 : 0;
    const response = await myCards.create({ ...data, order: newOrder });
    revalidatePath(`/b/${boardId}`) 
    return JSON.parse(JSON.stringify(response));
  } catch (err) {
    console.error("error: ", err);
  }
}

export async function deleteCard(id: string, boardId: string) {
  try {
    await connectDB();
    const response = await myCards.findByIdAndDelete(id);
    revalidatePath(`/b/${boardId}`) 
    return { success: true, response: JSON.parse(JSON.stringify(response)) }
  } catch (err) {
    console.error("error: ", err)
  }
}

export async function updateCard(id: string, updatedData: Partial<KanBan>, boardId: string) {
  try {
    await connectDB();
    const response = await myCards.findByIdAndUpdate(id, updatedData, { new: true });
    revalidatePath(`/b/${boardId}`) 
    return { success: true, response: JSON.parse(JSON.stringify(response)) };
  } catch (err) {
    console.error("error: ", err);
  }
}

export async function updateCardColumn(id: string, newColumn: string, boardId: string) {
  try {
    await connectDB();
    const response = await myCards.findByIdAndUpdate(id, { column: newColumn }, { new: true });
    return { success: true, response: JSON.parse(JSON.stringify(response)) };
  } catch (err) {
    console.error("error: ", err);
    return { success: false, response: null };
  }
}

export async function saveOrder(tasks: KanBan[], boardId: string) {
  try {
    await connectDB();
    await Promise.all(
      tasks.map((task, index) =>
        myCards.findByIdAndUpdate(task._id, { order: index })
      )
    );
  } catch (err) {
    console.error("error: ", err);
  }
}

export async function createColumn(name: string, boardId: string) {
  try {
    await connectDB()
    const column = await myColumns.create({ name })
    await Board.findByIdAndUpdate(boardId, {
      $push: { columns: column._id }
    }, { new: true })
    revalidatePath(`/b/${boardId}`) 
    revalidatePath("/board");
    return { success: true, data: JSON.parse(JSON.stringify(column)) }
  } catch (err) {
    console.error("error: ", err)
    return { success: false, error: "Failed to create column." }
  }
}

export async function createBoard(input: { name: string; userId: string; }) {
  try {
    await connectDB();
    const board = await Board.create({
      name: input.name.trim(),
      userId: input.userId,
      columns: [],
    });
    revalidatePath("/board");
    return { success: true, data: JSON.parse(JSON.stringify(board)) };
  } catch (err) {
    return { success: false, error: "Failed to create board." };
  }
}

export async function getBoardsByUser(userId: string) {
  try {
    await connectDB();
    const boards = await Board.find({ userId }).sort({ updatedAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(boards)) };
  } catch (err) {
    return { success: false, error: "Failed to fetch boards." };
  }
};

export async function updateBoard(id: string, name: string) {
  try {
    await connectDB();
    const response = await Board.findByIdAndUpdate(id, { name }, { new: true });
    revalidatePath("/board");
    return { success: true, data: JSON.parse(JSON.stringify(response)) };
  } catch (err) {
    console.error("error: ", err);
    return { success: false, error: "Failed to update board." };
  }
}

export async function deleteBoard(id: string) {
  try {
    await connectDB();
    await Board.findByIdAndDelete(id);
    revalidatePath("/board");
    return { success: true };
  } catch (err) {
    console.error("error: ", err);
    return { success: false, error: "Failed to delete board." };
  }
}

export async function changeCardColumn(cardId: string, newColumnId: string, boardId: string) {
  try {
    await connectDB();
    const response = await myCards.findByIdAndUpdate(
      cardId,
      { column: newColumnId },
      { new: true }
    );
    return { success: true, data: JSON.parse(JSON.stringify(response)) };
  } catch (err) {
    console.error("error: ", err);
    return { success: false, error: "Failed to change column." };
  }
}

export async function updateColumn(id: string, name: string, boardId: string) {
  try {
    await connectDB();
    const response = await myColumns.findByIdAndUpdate(id, { name }, { new: true });
    revalidatePath(`/b/${boardId}`); 
    return { success: true, data: JSON.parse(JSON.stringify(response)) };
  } catch (err) {
    console.error("error: ", err);
    return { success: false, error: "Failed to update column." };
  }
}

export async function deleteColumn(columnId: string, boardId: string) {
  try {
    await connectDB();
    await myCards.deleteMany({ column: columnId })
    await myColumns.findByIdAndDelete(columnId);
    await Board.findByIdAndUpdate(boardId, { $pull: { columns: columnId } });
    revalidatePath(`/b/${boardId}`); 
    return { success: true };
  } catch (err) {
    console.error("error: ", err);
    return { success: false, error: "Failed to delete column." };
  }
}