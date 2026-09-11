import pathlib from './pathlib.js';
import datetime from './datetime.js';
import collections from './collections.js';
import itertools from './itertools.js';
import json from './json.js';
import re from './re.js';
import asyncio from './asyncio.js';
import requests from './requests.js';
import httpx from './httpx.js';
import aiohttp from './aiohttp.js';
import fastapi from './fastapi.js';
import flask from './flask.js';
import django from './django.js';
import numpy from './numpy.js';
import pandas from './pandas.js';
import polars from './polars.js';
import matplotlib from './matplotlib.js';
import seaborn from './seaborn.js';
import plotly from './plotly.js';
import pydantic from './pydantic.js';
import dataclasses from './dataclasses.js';
import attrs from './attrs.js';
import sqlalchemy from './sqlalchemy.js';
import psycopg from './psycopg.js';
import sqlite3 from './sqlite3.js';
import redis from './redis.js';
import pytest from './pytest.js';
import hypothesis from './hypothesis.js';
import ruff from './ruff.js';
import mypy from './mypy.js';
import typer from './typer.js';
import click from './click.js';
import rich from './rich.js';
import bs4 from './bs4.js';
import playwright from './playwright.js';
import sklearn from './sklearn.js';
import pytorch from './pytorch.js';
import transformers from './transformers.js';
import langchain from './langchain.js';
import boto3 from './boto3.js';
import googlecloud from './googlecloud.js';
import celery from './celery.js';

export const GROUPS = [
  { id: 'essentials', label: 'Python essentials', blurb: 'Everyday language and standard-library patterns.' },
  { id: 'http', label: 'HTTP and APIs', blurb: 'Calling APIs and building backend services.' },
  { id: 'data', label: 'Data work', blurb: 'Arrays, tabular data, and visualization.' },
  { id: 'models', label: 'Validation and models', blurb: 'Structured data, parsing, and validation.' },
  { id: 'db', label: 'Databases', blurb: 'Persistence, queries, sessions, and caching.' },
  { id: 'testing', label: 'Testing and quality', blurb: 'Tests, linting, type checking, and code quality.' },
  { id: 'automation', label: 'Automation', blurb: 'CLIs, terminal output, scraping, browser automation.' },
  { id: 'ai', label: 'AI and ML', blurb: 'Conventional ML through LLM applications.' },
  { id: 'cloud', label: 'Cloud and integrations', blurb: 'Cloud APIs, background jobs, and task queues.' },
];
const labels = Object.fromEntries(GROUPS.map(g => [g.id, g.label]));
const ORDER = ["pathlib", "datetime", "collections", "itertools", "json", "re", "asyncio", "requests", "httpx", "aiohttp", "fastapi", "flask", "django", "numpy", "pandas", "polars", "matplotlib", "seaborn", "plotly", "pydantic", "dataclasses", "attrs", "sqlalchemy", "psycopg", "sqlite3", "redis", "pytest", "hypothesis", "ruff", "mypy", "typer", "click", "rich", "bs4", "playwright", "sklearn", "pytorch", "transformers", "langchain", "boto3", "googlecloud", "celery"];
export const LIBS = [pathlib, datetime, collections, itertools, json, re, asyncio, requests, httpx, aiohttp, fastapi, flask, django, numpy, pandas, polars, matplotlib, seaborn, plotly, pydantic, dataclasses, attrs, sqlalchemy, psycopg, sqlite3, redis, pytest, hypothesis, ruff, mypy, typer, click, rich, bs4, playwright, sklearn, pytorch, transformers, langchain, boto3, googlecloud, celery]
  .map(l => ({ ...l, groupLabel: labels[l.group] }))
  .sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
