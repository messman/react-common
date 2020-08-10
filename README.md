# react-common

**Status:** Not stable. Not recommended for use by anyone other than the creator.

Common tools for React that I've found myself copy-pasting to different projects, tweaking each time. Better to keep it all in one spot with centralized tracking and testing.

## Focus

Keep things as generic as possible. Don't rely on any other libraries beyond React. 

## Hooks

See https://github.com/facebook/react/issues/16956

What I learned from that thread:
- Don't set a ref in the render phase, unless it's just for initialization. 
	- A render can be scrapped before effects are run