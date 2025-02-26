import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { SessionInfo } from "core";
import MiniSearch from "minisearch";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  defaultBorderRadius,
  Input,
  lightGray,
  vscBackground,
  vscBadgeBackground,
  vscForeground,
  vscInputBackground,
} from "../components";
import HeaderButtonWithText from "../components/HeaderButtonWithText";
import useHistory from "../hooks/useHistory";
import { useNavigationListener } from "../hooks/useNavigationListener";
import { getFontSize } from "../util";

const SearchBar = styled.input`
  padding: 8px 8px;
  border: none;
  border-radius: ${defaultBorderRadius};
  outline: none;
  width: calc(90% );
  max-width: 500px;
  margin: 8px;
  background-color: ${vscInputBackground};
  color: ${vscForeground};
  &:focus {
    outline: none;
  }
`;

const Tr = styled.tr`
  &:hover {
    background-color: ${vscInputBackground};
  }

  overflow-wrap: anywhere;

  border-bottom: 1px solid ${vscInputBackground};
  border-top: 1px solid ${vscInputBackground};
`;

const parseDate = (date: string): Date => {
  let dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    dateObj = new Date(parseInt(date));
  }
  return dateObj;
};

const SectionHeader = styled.tr`
  padding: 4px;
  padding-left: 16px;
  padding-right: 16px;
  background-color: ${vscInputBackground};
  width: 100%;
  font-weight: bold;
  text-align: center;
  align-items: center;
  margin: 0;
  position: sticky;
  height: 1.5em;
`;

const TdDiv = styled.div`
  cursor: pointer;
  flex-grow: 1;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`;

function TableRow({
  session,
  date,
  onDelete,
  isSelected,
  from,
  onClose
}: {
  session: SessionInfo;
  date: Date;
  onDelete: (sessionId: string) => void;
  isSelected: boolean;
  from: string;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = window.serverUrl;
  const workspacePaths = window.workspacePaths || [""];
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sessionTitleEditValue, setSessionTitleEditValue] = useState(
    session.title,
  );

  const { saveSession, deleteSession, loadSession, getSession, updateSession } =
    useHistory(dispatch);

  const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (sessionTitleEditValue !== session.title) {
        session.title = sessionTitleEditValue;
        const persistedSessionInfo = await getSession(session.sessionId);
        persistedSessionInfo.title = sessionTitleEditValue;
        await updateSession(persistedSessionInfo);
        setEditing(false);
      }
    } else if (e.key === "Escape") {
      setEditing(false);
      setSessionTitleEditValue(session.title);
    }
  };

  return (
    <td
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={isSelected ? { backgroundColor: vscInputBackground } : {}}
    >
      <div className="flex justify-between items-center w-full">
        <TdDiv
          onClick={async () => {
            // Save current session
            saveSession();
            await loadSession(session.sessionId);
            navigate("/");
            // if (from === 'continue') {
            //   navigate("/");
            // } else {
            //   onClose();
            // }
          }}
        >
          <div className="text-md w-100">
            {editing ? (
              <Input
                type="text"
                style={{ width: "100%" }}
                ref={(titleInput) => titleInput && titleInput.focus()}
                value={sessionTitleEditValue}
                onChange={(e) => setSessionTitleEditValue(e.target.value)}
                onKeyUp={(e) => handleKeyUp(e)}
                onBlur={() => setEditing(false)}
              />
            ) : (
              JSON.stringify(session.title).slice(1, -1)
            )}
          </div>

          <div style={{ color: "#9ca3af" }}>
            {date.toLocaleString("en-US", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
            {" | "}
            {lastPartOfPath(session.workspaceDirectory || "")}
          </div>
        </TdDiv>

        {hovered && (
          <HeaderButtonWithText
            className="mr-2"
            text="Edit"
            onClick={async () => {
              setEditing(true);
            }}
          >
            <PencilSquareIcon width="1.3em" height="1.3em" />
          </HeaderButtonWithText>
        )}

        {hovered && (
          <HeaderButtonWithText
            className="mr-2"
            text="Delete"
            onClick={async () => {
              deleteSession(session.sessionId);
              onDelete(session.sessionId);
            }}
          >
            <TrashIcon width="1.3em" height="1.3em" />
          </HeaderButtonWithText>
        )}
      </div>
    </td>
  );
}

function lastPartOfPath(path: string): string {
  const sep = path.includes("/") ? "/" : "\\";
  return path.split(sep).pop() || path;
}

export type HistorySource = 'continue' | 'perplexity';

export function History({
  from = 'continue',
  onClose = () => { }
}: {
  from?: HistorySource,
  onClose?: () => void
}) {
  useNavigationListener();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [filteredAndSortedSessions, setFilteredAndSortedSessions] = useState<
    SessionInfo[]
  >([]);
  const apiUrl = window.serverUrl;
  const workspacePaths = window.workspacePaths || [];

  const deleteSessionInUI = async (sessionId: string) => {
    setSessions((prev) =>
      prev.filter((session) => session.sessionId !== sessionId),
    );
  };

  const [filteringByWorkspace, setFilteringByWorkspace] = useState(false);
  const stickyHistoryHeaderRef = React.useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const dispatch = useDispatch();
  const { getHistory, loadSession, saveSession } = useHistory(dispatch);

  const [minisearch, setMinisearch] = useState<
    MiniSearch<{ title: string; sessionId: string }>
  >(
    new MiniSearch({
      fields: ["title"],
      storeFields: ["title", "sessionId", "id"],
    }),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const tableRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = Math.min(selectedIndex + 1, filteredAndSortedSessions.length - 1);
      setSelectedIndex(newIndex);
      scrollSelectedIntoView(newIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = Math.max(selectedIndex - 1, 0);
      setSelectedIndex(newIndex);
      scrollSelectedIntoView(newIndex);
    } else if (e.key === "Enter" && selectedIndex !== -1) {
      e.preventDefault();
      const selectedSession = filteredAndSortedSessions[selectedIndex];
      saveSession();
      loadSession(selectedSession.sessionId);
      navigate("/");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, filteredAndSortedSessions]);

  const scrollSelectedIntoView = (index: number) => {
    if (tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tr');
      if (rows[index]) {
        rows[index].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      const sessions = await getHistory();
      setSessions(sessions);
      minisearch.addAll(
        sessions.map((session) => ({
          title: session.title,
          sessionId: session.sessionId,
          id: session.sessionId,
        })),
      );
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    const sessionIds = minisearch
      .search(searchTerm, {
        fuzzy: 0.1,
      })
      .map((result) => result.id);

    setFilteredAndSortedSessions(
      sessions
        .filter((session) => {
          if (
            !filteringByWorkspace ||
            typeof workspacePaths === "undefined" ||
            typeof session.workspaceDirectory === "undefined"
          ) {
            return true;
          }
          return workspacePaths.includes(session.workspaceDirectory);
        })
        // Filter by session type
        .filter((session) => {
          if (typeof from === "undefined") {
            return true;
          }
          if (from == 'continue' && !session.integrationType) {
            return true;  // older history with no integration type
          }
          return session.integrationType === from;
        })
        // Filter by search term
        .filter((session) => {
          return searchTerm === "" || sessionIds.includes(session.sessionId);
        })
        .sort(
          (a, b) =>
            parseDate(b.dateCreated).getTime() -
            parseDate(a.dateCreated).getTime(),
        ),
    );
  }, [filteringByWorkspace, sessions, searchTerm, minisearch]);

  useEffect(() => {
    setHeaderHeight(stickyHistoryHeaderRef.current?.clientHeight || 100);
  }, [stickyHistoryHeaderRef.current]);

  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const lastWeek = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const lastMonth = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const earlier = new Date(0);

  return (
    <div
      className="flex flex-col"
      style={{ fontSize: getFontSize() }}
      tabIndex={0}
      ref={tableRef}
    >
      {from === 'perplexity' ?
        <h2>Search History</h2>
        :
        <div
          ref={stickyHistoryHeaderRef}
          className="sticky top-0"
          style={{ backgroundColor: vscBackground }}
        >
          <div
            className="items-center flex m-0 p-0"
            style={{
              borderBottom: `0.5px solid ${lightGray}`,
            }}
          >
            <ArrowLeftIcon
              width="1.2em"
              height="1.2em"
              onClick={() => navigate("/")}
              className="inline-block ml-4 cursor-pointer"
            />
            <h3 className="text-lg font-bold m-2 inline-block">History</h3>
          </div>
        </div>}

      <div className="flex flex-col h-full">
        <SearchBar
          placeholder="Search past sessions"
          type="text"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredAndSortedSessions.length === 0 && (
          <div className="text-center m-4">
            No past sessions found.
            <br />
            To start a new session, either click the "+"
            button or use the keyboard shortcut:
            <br />
            <b>Option + Command + N</b>
          </div>
        )}

        <table className="w-full border-spacing-0 border-collapse">
          <tbody>
            {filteredAndSortedSessions.map((session, index) => {
              const prevDate =
                index > 0
                  ? parseDate(filteredAndSortedSessions[index - 1].dateCreated)
                  : earlier;
              const date = parseDate(session.dateCreated);
              return (
                <Fragment key={index}>
                  {from === 'continue' && index === 0 && date > yesterday && (
                    <SectionHeader style={{ top: `${headerHeight - 1}px` }}>
                      <td>Today</td>
                    </SectionHeader>
                  )}
                  {from === 'continue' && date < yesterday &&
                    date > lastWeek &&
                    prevDate > yesterday && (
                      <SectionHeader style={{ top: `${headerHeight - 1}px` }}>
                        <td>This Week</td>
                      </SectionHeader>
                    )}
                  {from === 'continue' && date < lastWeek &&
                    date > lastMonth &&
                    prevDate > lastWeek && (
                      <SectionHeader style={{ top: `${headerHeight - 1}px` }}>
                        <td>This Month</td>
                      </SectionHeader>
                    )}
                  <Tr key={`row-${index}`}>
                    <TableRow
                      session={session}
                      date={date}
                      onDelete={() => deleteSessionInUI(session.sessionId)}
                      isSelected={index === selectedIndex}
                      from={from}
                      onClose={onClose}
                    ></TableRow>
                  </Tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
        <div className="flex-grow" />
      </div>
      <div className="flex-grow"></div>
      <div className="text-center text-sm mb-4 text-gray-500">
        All session data is saved in ~/.pearai/sessions
      </div>
    </div>
  );
}

export default History;
