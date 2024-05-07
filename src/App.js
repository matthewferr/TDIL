import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";

function Counter() {
  const [count, setCount] = useState(8);

  return (
    <div>
      <span style={{ fontSize: "40px" }}>{count}</span>
      <button className="btn btn-large" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}

function App() {
  //define state var
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCat, setCurrentCat] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCat !== "all") query = query.eq("category", currentCat);

        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);

        if (!error) setFacts(facts);
        else alert("There was a problem gathering the data");
        setFacts(facts);
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCat]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {/* use state var */}
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCat={setCurrentCat} />

        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <img src="loading.gif" alt="Loading Gif" className="message" />;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Today I Learned";

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>{appTitle}</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        //update state var
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLen = text.length;

  async function handleSubmit(e) {
    // 1. prevent browser reload
    e.preventDefault();
    console.log(text, source, category);
    console.log(isValidHttpUrl(source));

    //2.check if data valid. if so create new fact
    if (text && isValidHttpUrl(source) && category && textLen <= 200) {
      //3 create new fact obj (w/o database, so not used since we have a databaes)
      // const newFact = {
      //   id: Math.round(Math.random() * 100000000),
      //   text,
      //   source,
      //   category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      // 3.upload fact to database, recieve fact obj
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      //4.add new fact to UI ( add to state )
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      //5. reset input fields to default (not rly necessaey but good practice)
      setText("");
      setSource("");
      setCategory("");

      //6.close form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the word..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLen}</span>
      <input
        value={source}
        type="text"
        placeholder="Trustworthy source..."
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCat }) {
  return (
    <aside className="stick">
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCat("all")}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCat(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        {" "}
        No facts for this category yet. Create the first one!
      </p>
    );
  }

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      {
        <p className="factnum">
          {facts.length === 1
            ? "There is 1 fact in the database. Add your own!"
            : "There are " +
              facts.length +
              " facts in the database. Add your own!"}
        </p>
      }
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblow < fact.votesFalse;

  async function handleVote(columnName) {
    const updateVote = async function (name, value) {
      setIsUpdating(true);

      const { data: updatedFact, error } = await supabase
        .from("facts")
        .update({ [name]: fact[name] + value })
        .eq("id", fact.id)
        .select();

      setIsUpdating(false);

      if (!error)
        setFacts((facts) =>
          facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
        );
    };

    if (!isClicked) {
      //false no btn clicked

      setIsClicked(columnName);
      updateVote(columnName, 1);
    }
    if (isClicked === columnName) {
      //clicking on btn already clicked, so reduce
      setIsClicked(false);
      updateVote(columnName, -1);
    }
    if (isClicked !== columnName) {
      //add 1 to new btn. -1 to prev. clicked
      updateVote(isClicked, -1);
      setIsClicked(columnName);
      updateVote(columnName, 1);
    }
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed"> [DISPUTED]</span> : null}
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          className={isClicked === "votesInteresting" ? "active" : ""}
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          className={isClicked === "votesMindblow" ? "active" : ""}
          onClick={() => handleVote("votesMindblow")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblow}
        </button>
        <button
          className={isClicked === "votesFalse" ? "active" : ""}
          onClick={() => handleVote("votesFalse")}
          disabled={isUpdating}
        >
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
