const circ_list = require("../CircularList")
let CList = circ_list.CList

test('CircularList empty_iteration', () => {
	let list = new CList;
	expect(list.size()).toBe(0);
	for (let it = list.begin(); it.not_equals(list.end()); it.increment()) {
		fail('should not get to the iteration body');
	}
});

test('CircularList empty_back_iteration', () => {
	list = new CList;
	for (let it = list.rbegin(); it.not_equals(list.rend()); it.decrement()) {
		fail('should not get to the iteration body');
	}
});

test('CircularListIteratorTest, one_item_iteration', () => {
	let list = new CList;
	list.insert(list.begin(), 42);
	expect(list.size()).toBe(1);
	var i = 0;
	for (let it = list.begin(); it.not_equals(list.end()); it.increment()) {
		expect(it.deref()).toBe(42);
		expect(i).toBe(0);
		++i;
	}
});

test('CircularListIteratorTest, one_item_back_iteration', () => {
	let list = new CList;
	list.insert(list.rbegin(), 42);
	var i = 0;
	for (let it = list.rbegin(); it.not_equals(list.rend()); it.decrement()) {
		expect(it.deref()).toBe(42);
		expect(i).toBe(0);
		++i;
	}
});

test('CircularListIteratorTest, many_items_iteration', () => {
	let list = new CList;
	let data = [42, 88, 95, 174];
	for (var i = 0; i < data.length; ++i) {
		list.push_back(data[i]);
	}
	expect(list.size()).toBe(4);
	var vit = 0;
	for (let it = list.begin(); it.not_equals(list.end()); it.increment()) {
		expect(it.deref()).toBe(data[vit]);
		++vit;
	}
});

test('CircularListIteratorTest, many_items_back_iteration', () => {
	let list = new CList;
	let data = [42, 88, 95, 174];
	for (var i = 0; i < data.length; ++i) {
		list.push_front(data[i]);
	}
	var vit = 3;
	for (let it = list.rbegin(); it.not_equals(list.rend()); it.decrement()) {
		expect(it.deref()).toBe(data[vit]);
		vit = (vit + 1) % data.length
	}
});
