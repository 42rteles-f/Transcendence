#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>

#ifndef BUFFER_SIZE
# define BUFFER_SIZE 1
#endif

static char *nextline(char **currentLINE, char *buffada, int *bufferSTART, int *bufferEND, int readded, int *ENDTOTAL)
{
    char        *line;
    int         index;

    if (readded <= 0)
        return (*currentLINE);
	while (buffada[*bufferEND] != '\n' && *bufferEND < readded)
	{
		(*bufferEND)++;
		(*ENDTOTAL)++;
	}
    if ((readded - *bufferSTART) <= 0)  //linha redundante, já presente no GET principal.
        *bufferSTART = 0;               //linha redundante, bufferSTART já tá sendo zerado no outro GET.
    line = malloc(((*ENDTOTAL) + 1 + (buffada[(*bufferEND)] == '\n')) * sizeof(char));
    if (!line)
		return (NULL);
    index = -1;
    while (++index < (*ENDTOTAL - *bufferEND) )
		line[index] = (*currentLINE)[index];
    while (*bufferSTART <= (*bufferEND) && *bufferSTART < BUFFER_SIZE && (readded - *bufferSTART) )
		line[index++] = buffada[(*bufferSTART)++];
    line[index] = '\0';
    free(*currentLINE);
    return (line);
}

char *get_next_line(int fd)
{
    static char buffada[BUFFER_SIZE];
    static int  readded = BUFFER_SIZE;
    static int  bufferSTART = BUFFER_SIZE;
    static int  bufferEND = 0;
    char 		*currentLINE;
    int         ENDTOTAL;
	
    if (fd < 0)
		return (NULL);
	if (readded == 0)
	{
		readded = BUFFER_SIZE;
		bufferSTART = BUFFER_SIZE;
		bufferEND = 0;
	}
	ENDTOTAL = 0;
	currentLINE = NULL;
    while (buffada[bufferEND] != '\n' && readded > 0)
    {
        if (bufferSTART >= readded)
        {
            bufferSTART = 0;
            bufferEND = 0;
            readded = read(fd, buffada, BUFFER_SIZE);
        }
		currentLINE = nextline(&currentLINE, buffada, &bufferSTART, &bufferEND, readded, &ENDTOTAL);
    }
	bufferEND += (buffada[bufferEND] == '\n');
    return (currentLINE);
}

int main(void)
{
    int fd;

    fd = open("./test.txt", O_RDONLY);
	printf("open %i\n", fd);
    char *line1 = get_next_line(fd);
    printf("GET1:  %s\n\n\n", line1);
    
    char *line2 = get_next_line(fd);
    printf("GET2:  %s\n\n\n", line2);
    

    char *line3 = get_next_line(fd);
    printf("GET3:  %s\n\n\n", line3);
    
    char *line4 = get_next_line(fd);
    printf("GET4:  %s\n\n\n", line4);

    char *line5 = get_next_line(fd);
    printf("GET5:  %s\n\n\n", line5);

}