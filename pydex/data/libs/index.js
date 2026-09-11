import numpy from './numpy.js';
import pandas from './pandas.js';
import polars from './polars.js';
import matplotlib from './matplotlib.js';
import sklearn from './sklearn.js';
import requests from './requests.js';
import bs4 from './bs4.js';
import fastapi from './fastapi.js';
import pydantic from './pydantic.js';
import pytest from './pytest.js';
import sqlalchemy from './sqlalchemy.js';
import asyncio from './asyncio.js';

export const GROUPS = [
  { id: 'data', label: 'Data & numbers', blurb: 'Arrays, tables, plots and models.' },
  { id: 'web', label: 'Web & HTTP', blurb: 'Talk to APIs, scrape pages, serve endpoints.' },
  { id: 'correct', label: 'Correctness', blurb: 'Validate inputs and test behaviour.' },
  { id: 'store', label: 'Storage', blurb: 'Databases without writing raw SQL everywhere.' },
  { id: 'async', label: 'Concurrency', blurb: 'Many slow things at once.' },
];
const labels = Object.fromEntries(GROUPS.map(g => [g.id, g.label]));
export const LIBS = [numpy, pandas, polars, matplotlib, sklearn, requests, bs4, fastapi, pydantic, pytest, sqlalchemy, asyncio]
  .map(l => ({ ...l, groupLabel: labels[l.group] }));
