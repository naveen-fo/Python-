// To add a lesson: add one L(title, explanation, starterCode, expectedOutput) line to a level.
const L = (t, e, c, x) => ({ id: t.toLowerCase().replace(/\W+/g, '-'), t, e, c, x });

export const LEVELS = [
  {
    name: 'Basic',
    lessons: [
      L('Hello, print()', 'print() shows text on the screen. Put the text inside quotes.',
        `# Task: print Hello, Python!
`, 'Hello, Python!'),
      L('Variables and types', 'A variable stores a value. type() tells you what kind of value it is.',
        `# Task: store 25 in age, then print its type
age =
print(type(age))
`, "<class 'int'>"),
      L('Strings', 'Strings are text. Methods like .upper() and .lower() change the case.',
        `s = "python"
# Task: print s in capital letters
`, 'PYTHON'),
      L('Numbers and math', '+ - * / work like a calculator. // gives a whole-number result and % gives the remainder.',
        `# Task: print the whole-number result of 17 divided by 5
`, '3'),
      L('If and else', 'if runs code only when a condition is true. else runs when it is not.',
        `n = 7
# Task: print "odd" if n is odd, otherwise print "even"
`, 'odd'),
      L('Loops', 'A for loop repeats code. range(1, 4) gives 1, 2, 3.',
        `# Task: print the numbers 1 to 5, one per line
`, '1\n2\n3\n4\n5'),
      L('Lists', 'A list keeps items in order. Use .append(), indexing and sorted().',
        `nums = [3, 1, 2]
# Task: print the list sorted from small to big
`, '[1, 2, 3]'),
      L('Dictionaries', 'A dictionary stores key: value pairs. Add a pair with d[key] = value.',
        `d = {"a": 1}
# Task: add the key "b" with value 2, then print d
`, "{'a': 1, 'b': 2}"),
      L('Functions', 'def creates a function. return sends a value back to the caller.',
        `# Task: write square(n) that returns n * n, then print square(6)
`, '36'),
    ],
  },
  {
    name: 'Intermediate',
    lessons: [
      L('Sets and tuples', 'A set keeps only unique items. A tuple is a list that cannot change.',
        `items = [1, 1, 2, 3, 3]
# Task: print how many unique items there are
`, '3'),
      L('List comprehensions', '[expression for x in items] builds a list in one line.',
        `# Task: print a list of the squares of 1 to 5
`, '[1, 4, 9, 16, 25]'),
      L('f-strings', 'Put f before the quotes and write variables inside { }.',
        `name = "Ravi"
age = 20
# Task: use an f-string to print: Ravi is 20
`, 'Ravi is 20'),
      L('Errors with try and except', 'try runs risky code. except catches the error so your program does not crash.',
        `# Task: divide 10 by 0 inside try; in except ZeroDivisionError print: Cannot divide by zero
`, 'Cannot divide by zero'),
      L('Modules', 'import gives you ready-made tools. math has sqrt, pi, floor and more.',
        `# Task: import math and print the square root of 81
`, '9.0'),
      L('Lambda and sorting', 'A lambda is a tiny one-line function. sorted(items, key=...) sorts using it.',
        `words = ["pear", "fig", "apple"]
# Task: print the words sorted by length, shortest first
`, "['fig', 'pear', 'apple']"),
      L('JSON', 'json.dumps turns Python data into text. json.loads turns it back.',
        `import json
data = {"a": 1}
# Task: print data as a JSON string
`, '{"a": 1}'),
      L('Regular expressions', 're finds patterns in text. \\d+ matches one or more digits.',
        `import re
text = "a1b22c333"
# Task: print all the numbers found in text (use re.findall)
`, "['1', '22', '333']"),
      L('Classes and objects', 'A class is a blueprint. Methods are functions inside it, and self is the object itself.',
        `class Dog:
    pass

# Task: give Dog a speak() method that returns "Woof", then print Dog().speak()
`, 'Woof'),
    ],
  },
  {
    name: 'Advanced',
    lessons: [
      L('Dunder methods', 'Special methods like __repr__ and __add__ let your class work with print() and +.',
        `class Vec:
    def __init__(self, x, y):
        self.x, self.y = x, y

# Task: add __add__ and __repr__ so the line below prints Vec(4, 6)
print(Vec(1, 2) + Vec(3, 4))
`, 'Vec(4, 6)'),
      L('Generators', 'yield makes a function produce values one at a time and remember where it stopped.',
        `# Task: write fib(n) that yields the first n Fibonacci numbers,
# then print(list(fib(6)))
`, '[0, 1, 1, 2, 3, 5]'),
      L('Decorators', 'A decorator wraps a function to add behaviour without changing its code.',
        `def shout(fn):
    # Task: return a wrapper that makes the result of fn UPPERCASE
    ...

@shout
def greet():
    return "hello"

print(greet())
`, 'HELLO'),
      L('Context managers', 'with guarantees that cleanup code runs, even when an error happens.',
        `class Session:
    def __enter__(self):
        print("open")
        return self
    # Task: add __exit__ so "close" prints when the block ends

with Session():
    print("hi")
`, 'open\nhi\nclose'),
      L('Dataclasses and type hints', '@dataclass writes __init__ and __repr__ for you. Type hints say what each field holds.',
        `from dataclasses import dataclass

# Task: make a dataclass Point with int fields x and y

print(Point(1, 2))
`, 'Point(x=1, y=2)'),
      L('Caching with lru_cache', 'lru_cache remembers results, so slow recursive code becomes fast.',
        `from functools import lru_cache

# Task: write a cached recursive fib(n), then print fib(30)
`, '832040'),
      L('async and await', 'async functions can wait without blocking. asyncio.gather runs them together.',
        `import asyncio

async def work(n):
    await asyncio.sleep(0.01)
    return n * 2

# Task: run work(1), work(2), work(3) together with gather and print the results
# (Pyodide allows await at the top level. In normal Python, use asyncio.run.)
`, '[2, 4, 6]'),
    ],
  },
];
