The historical connection between [Andrej Karpathy](https://www.google.com/search?kgmid=/g/11f8bqvtw4&q=historical+%22Memex%22+connection+Karpathy) and the "Memex" centers on his "LLM-Wiki" pattern, a personal knowledge management concept he released in early April 2026. Karpathy explicitly references [Vannevar Bush’s 1945 Memex vision](https://taylorpearson.me/as-we-may-work/) to explain why LLMs are the "missing link" for building a truly functional personal knowledge base. [1, 2, 3] 
## The Core Connection: Maintenance vs. Thinking
The Memex was a hypothetical device envisioned by Vannevar Bush in his essay "[As We May Think](https://pub.towardsai.net/andrej-karpathy-killed-rag-or-did-he-the-llm-wiki-pattern-7824d876e790)" to store books and communications, using "associative trails" to link ideas. [1, 4] 
Karpathy argues that the reason the Memex never truly existed (and why personal wikis like Obsidian or Notion often fail) is the "bookkeeping bottleneck"—the tedious manual effort required to link documents, update cross-references, and maintain consistency. [2, 4] 

* Bush's Vision: A private, curated store of knowledge with deep, associative links.
* The Problem: Humans get bored with the grunt work of "filing" and "cross-referencing".
* Karpathy's Solution: LLMs act as the "librarian." They do the maintenance (writing the wiki, updating links, reconciling new info) while the human focuses on "thinking" and "curating". [2, 4, 5] 

## The "LLM-Wiki" Architecture
Karpathy's [llm-wiki GitHub Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) outlines a three-layer system designed to realize the Memex vision: [5, 6] 

* Layer 1: Raw Sources: Immutable documents (PDFs, notes, images) that serve as the ground truth.
* Layer 2: The Wiki: A collection of Markdown files entirely owned and maintained by the LLM (summaries, concept pages, etc.).
* Layer 3: The Schema: A governance document (like a .claude.md file) that instructs the AI on how to organize and link the information. [7, 8] 

Karpathy maintains that this approach is superior to traditional RAG (Retrieval-Augmented Generation) for personal use because it creates a compounding, human-readable structure rather than a "noisy" database of accidental connections. [2, 9] 
Are you looking for help setting up a personal LLM-Wiki using tools like [Claude Code](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6092683) or Obsidian?

[1] [https://pub.towardsai.net](https://pub.towardsai.net/andrej-karpathy-killed-rag-or-did-he-the-llm-wiki-pattern-7824d876e790)
[2] [https://medium.com](https://medium.com/@k.balu124/i-used-karpathys-llm-wiki-to-build-a-knowledge-base-that-maintains-itself-with-ai-df968e4f5ea0)
[3] [https://gist.github.com](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6086747#:~:text=marciopuga%20commented%2017%20hours%20ago.%20Amazing%20thinking%20as%20usual%20@karpathy!&text=The%20Memex%20was%20a%20hypothetical%20device%20%E2%80%94,tools%20for%20managing%20knowledge%20should%20reflect%20that.)
[4] [https://gist.github.com](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6086278)
[5] [https://gist.github.com](https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2)
[6] [https://gist.github.com](https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2)
[7] [https://gist.github.com](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6086341)
[8] [https://gist.github.com](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6092252)
[9] [https://medium.com](https://medium.com/@mustafa.gencc94/your-llm-has-been-forgetting-everything-karpathys-wiki-pattern-is-the-fix-6931ad90017b)

