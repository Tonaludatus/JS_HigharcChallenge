
class CListItem {
	constructor(data) {
		this.data = data;
		this.next = this;
		this.prev = this;
	}
};

class iterator {
	constructor(/*CList*/ l, /*CListItem*/ i, /*int*/r) {
		this.list = l;
		this.item = i;
		this.revolution_num = r;
	}

	/* returns iterator */
	increment() {
		if (this.item.next == this.list.head) {
			++this.revolution_num;
		}
		this.item = this.item.next;
		return this;
	}
	/* returns iterator */
	decrement() {
		if (this.item.prev == this.list.head) {
			--this.revolution_num;
		}
		this.item = this.item.prev;
		return this;
	}

	/* returns iterator */
	circularAdvancedBy(/*int*/ n) {
		var ret = new iterator(this.list, this.item, this.revolution_num)
		if (n >= 0) {
			for (var i = 0; i < n; ++i) {
				ret.item = ret.item.next;
			}
		}
		else {
			for (var i = 0; i > n; --i) {
				ret.item = ret.item.prev;
			}
		}
		return ret;
	}

	/* returns Data of CList */
	deref() { return this.item.data; }

	/* returns bool */
	equals(/*iterator*/ other) {
		var eq = (this.list == other.list) &&
			(this.item == other.item) &&
			(this.revolution_num == other.revolution_num || this.item == null);
		return eq;
	}

	/* returns bool */
	not_equals(/*iterator*/ other) {
		return !(this.equals(other));
	}

	/* returns iterator */
	assign_from(/*iterator*/ other) {
		this.list = other.list;
		this.item = other.item;
		this.revolution_num = other.revolution_num;
		return this;
	}

	/* returns iterator */
	clone() {
		return new iterator(
			this.list,
			this.item,
			this.revolution_num
		);
    }
}


class CList {

	constructor() {
		this.head = null;
	}

	/* returns iterator */
	insertImpl(/*iterator*/ before_this, /*CListItem*/ item) {
		if (before_this.item == null) {
			this.head = item;
			return new iterator(this, this.head, 0);
		}
		if (before_this.equals(this.begin())) {
			this.head = item;
		}
		item.prev = before_this.item.prev;
		item.next = before_this.item;
		before_this.item.prev = item;
		item.prev.next = item;
		return new iterator(this, item, 0);
	}

	/* returns iterator */
	pushFrontImpl(/*CListItem*/ item) {
		var ret = this.insertImpl(this.begin(), item);
		this.head = item;
		return ret;
	}

	/* returns iterator */
	pushBackImpl(/*CListItem*/ item) {
		var ret = this.insertImpl(this.end(), item);
		return ret;
	}

	/* returns size_t */
	size() {
		// Slow implementation in favor of less memory footprint
		var ret = 0;
		var it = this.begin();
		while (it.not_equals(this.end())) {
			++ret;
			it.increment();
		}
		return ret;
	}

	/* returns iterator */
	end() {
		return new iterator(this, this.head, 1);
	}

	/* returns iterator */
	begin() {
		return new iterator(this, this.head, 0);
	}

	/* returns iterator */
	rend() {
		return new iterator(this, this.head, -1);
	}

	/* returns iterator */
	rbegin() {
		return new iterator(this, this.head, 0);
	}

	/* returns iterator */
	insert(/*iterator*/ before_this, /*Data*/to_insert) {
		return this.insertImpl(before_this, new CListItem(to_insert));
	}

	/* returns iterator */
	push_front(/*Data*/ to_insert) {
		return this.pushFrontImpl(new CListItem(to_insert));
	}

	/* returns iterator */
	push_back(/*Data*/ to_insert) {
		return this.pushBackImpl(new CListItem(to_insert));
	}
}

module.exports = {
	iterator: iterator,
	CListItem: CListItem,
	CList: CList
};
