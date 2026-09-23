/**
 * The running example used in the technique and applications chapters.
 * One pyramid, three forms: answers (going out), questions (issue tree), claims (hypotheses).
 * Ids are stable across forms so a morph is a text crossfade, never a re-layout.
 */
import type { PyramidNode } from "./components/pyramid/layout";

export const ANSWER_TREE: PyramidNode = {
  id: "root",
  text: "Raise the price of the core plan 8% in January",
  children: [
    {
      id: "cust",
      text: "Customers will stay",
      children: [
        { id: "cust-1", text: "94% renewed after the last increase" },
        { id: "cust-2", text: "Value rated 4.6 / 5 in the survey" },
        { id: "cust-3", text: "Churn risk sits in one segment we can grandfather" },
      ],
    },
    {
      id: "comp",
      text: "Competitors already moved",
      children: [
        { id: "comp-1", text: "Two of three rivals raised 6–10% this year" },
        { id: "comp-2", text: "We are now the lowest price in the category" },
        { id: "comp-3", text: "They lost no share when they moved" },
      ],
    },
    {
      id: "co",
      text: "We need the margin",
      children: [
        { id: "co-1", text: "Cost base up 11% in two years" },
        { id: "co-2", text: "Margin target missed two quarters running" },
        { id: "co-3", text: "8% closes the gap" },
      ],
    },
  ],
};

/** Level-3 facts under "94% renewed": the bottom of the pyramid is data you can point to. */
export const FACT_ROWS: PyramidNode = {
  id: "cust-1",
  text: "94% renewed after the last increase",
  children: [
    { id: "fact-1", text: "Cohort: 12,400 accounts" },
    { id: "fact-2", text: "Window: 90 days post-change" },
    { id: "fact-3", text: "Source: billing system, Q2" },
  ],
};

/** Same ids, question form. */
export const QUESTION_TEXT: Record<string, string> = {
  root: "Should we raise the price?",
  cust: "Will customers stay?",
  "cust-1": "How many stayed last time?",
  "cust-2": "Do they value the product?",
  "cust-3": "Who is at risk?",
  comp: "What have competitors done?",
  "comp-1": "Who raised, and by how much?",
  "comp-2": "Where does our price sit now?",
  "comp-3": "What happened to their share?",
  co: "Do we need it?",
  "co-1": "How have costs moved?",
  "co-2": "Are we hitting margin targets?",
  "co-3": "How much would close the gap?",
};

/** Same ids, hypothesis form ("what must be true"). */
export const HYPOTHESIS_TEXT: Record<string, string> = {
  root: "We should raise the price 8%",
  cust: "Customers will stay",
  "cust-1": "Retention held after the last increase",
  "cust-2": "Customers value the product",
  "cust-3": "At-risk customers can be protected",
  comp: "Competitors have already moved",
  "comp-1": "Most rivals raised this year",
  "comp-2": "We are priced below the market",
  "comp-3": "Their increases did not cost share",
  co: "We need the margin",
  "co-1": "Costs have risen faster than price",
  "co-2": "We are below target",
  "co-3": "8% is enough",
};

/** Work plan: owner initials per branch. */
export const OWNERS: Record<string, string> = { cust: "AK", comp: "JM", co: "RS" };
