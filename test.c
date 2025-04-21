#include <unistd.h>

int main(void) {
	int *a = malloc(sizeof(int));
	*a = 3;

	int *b = a;
	char *c = (char *)b;

	*c = 0;
	if (*b != 3)
		write(1, "compile ok\n", 12);
	else 
		write(1, "compile error\n", 15);
}