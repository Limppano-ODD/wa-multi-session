import { proto } from "@whiskeysockets/baileys";
import { Messages } from "../Defaults";
import { getSession } from "../Socket";
import {
  SendMediaTypes,
  SendMessageTypes,
  SendPollMessageTypes,
  SendReadTypes,
  SendTypingTypes,
} from "../Types";
import { phoneToJid } from "../Utils";
import { createDelay } from "../Utils/create-delay";
import { isExist } from "../Utils/is-exist";
import mime from "mime";
import { WhatsappError } from "../Error";

export const sendTextMessage = async ({
  sessionId,
  to,
  text = "",
  isGroup = false,
  ...props
}: SendMessageTypes): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));
  to = phoneToJid({ to, isGroup });

  return await session.sendMessage(
    to,
    {
      text: text,
    },
    {
      quoted: props.answering,
    }
  );
};
export const sendImage = async ({
  sessionId,
  to,
  text = "",
  isGroup = false,
  media,
  ...props
}: SendMediaTypes): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));
  to = phoneToJid({ to, isGroup });

  if (!media)
    throw new WhatsappError("parameter media must be Buffer or String URL");
  return await session.sendMessage(
    to,
    {
      image:
        typeof media == "string"
          ? {
              url: media,
            }
          : media,
      caption: text,
    },
    {
      quoted: props.answering,
    }
  );
};
export const sendVideo = async ({
  sessionId,
  to,
  text = "",
  isGroup = false,
  media,
  ...props
}: SendMediaTypes): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));
  to = phoneToJid({ to, isGroup });

  if (!media)
    throw new WhatsappError("parameter media must be Buffer or String URL");
  return await session.sendMessage(
    to,
    {
      video:
        typeof media == "string"
          ? {
              url: media,
            }
          : media,
      caption: text,
    },
    {
      quoted: props.answering,
    }
  );
};
export const sendDocument = async ({
  sessionId,
  to,
  text = "",
  isGroup = false,
  media,
  filename,
  ...props
}: SendMediaTypes & {
  filename: string;
}): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));
  to = phoneToJid({ to, isGroup });

  if (!media) {
    throw new WhatsappError(`Invalid Media`);
  }

  const mimetype = mime.getType(filename);
  if (!mimetype) {
    throw new WhatsappError(`Filename must include valid extension`);
  }

  return await session.sendMessage(
    to,
    {
      fileName: filename,
      document:
        typeof media == "string"
          ? {
              url: media,
            }
          : media,
      mimetype: mimetype,
      caption: text,
    },
    {
      quoted: props.answering,
    }
  );
};

export const sendVoiceNote = async ({
  sessionId,
  to,
  isGroup = false,
  media,
  ...props
}: Omit<SendMediaTypes, "text">): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));
  to = phoneToJid({ to, isGroup });

  if (!media) {
    throw new WhatsappError(`Invalid Media`);
  }

  return await session.sendMessage(
    to,
    {
      audio:
        typeof media == "string"
          ? {
              url: media,
            }
          : media,
      ptt: true,
    },
    {
      quoted: props.answering,
    }
  );
};

export const sendSticker = async ({
  sessionId,
  to,
  isGroup,
  media,
  ...props
}: SendMediaTypes): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));
  to = phoneToJid({ to, isGroup });

  if (!media) {
    throw new WhatsappError(`Invalid Media`);
  }

  return await session.sendMessage(
    to,
    {
      sticker:
        typeof media == "string"
          ? {
              url: media,
            }
          : media,
    },
    {
      quoted: props.answering,
    }
  );
};

/**
 * Send a poll message
 *
 * @param sessionId - Session ID
 * @param to - Target
 * @param pollName - Poll question/name
 * @param pollValues - Array of poll options
 * @param selectableCount - Number of options that can be selected (default: 1)
 * @param toAnnouncementGroup - Send to announcement group (default: false)
 */
export const sendPollMessage = async ({
  sessionId,
  to,
  pollName,
  pollValues,
  selectableCount = 1,
  toAnnouncementGroup = false,
  isGroup = false,
  ...props
}: SendPollMessageTypes): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));
  to = phoneToJid({ to, isGroup });

  if (!pollName) {
    throw new WhatsappError("Poll name is required");
  }

  if (!pollValues || pollValues.length < 2) {
    throw new WhatsappError("Poll must have at least 2 options");
  }

  if (selectableCount < 1 || selectableCount > pollValues.length) {
    throw new WhatsappError(
      `Selectable count must be between 1 and ${pollValues.length}`
    );
  }

  return await session.sendMessage(
    to,
    {
      poll: {
        name: pollName,
        values: pollValues,
        selectableCount: selectableCount,
        toAnnouncementGroup: toAnnouncementGroup,
      },
    },
    {
      quoted: props.answering,
    }
  );
};

/**
 * Give typing effect to target
 *
 * Looks like human typing
 *
 *
 * @param sessionId - Session ID
 * @param to - Target
 * @param duration - Duration in miliseconds typing effect will appear
 */
export const sendTyping = async ({
  sessionId,
  to,
  duration = 1000,
  isGroup = false,
}: SendTypingTypes) => {
  const oldPhone = to;
  to = phoneToJid({ to, isGroup });
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));

  await session.sendPresenceUpdate("composing", to);
  await createDelay(duration);
  await session.sendPresenceUpdate("available", to);
};

/**
 * Give typing effect to target
 *
 * Looks like human typing
 *
 *
 * @param sessionId - Session ID
 * @param to - Target
 * @param duration - Duration in miliseconds typing effect will appear
 */
export const readMessage = async ({ sessionId, key }: SendReadTypes) => {
  const session = getSession(sessionId);
  if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));

  await session.readMessages([key]);
};
