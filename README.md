# XSHL
## SCHEMAS v1.1

1. Иерархия:
- section 
    - section
    - containers
    - chunk
    - definitions
Имеют ссылки на chunk, definitions, containers и другие section.    
 - containers
    - chunk
    - definitions
    - containers
Имеют ссылки на chunk, definitions и другие containers.
- chunk
    - definitions
Имеют ссылки только на definitions.
- definitions 
Не имеют ссылок внутри себя на другие объекты.

2. Пагинацию в виде фалов могут иметь только sections.

Циклическая вложенность не допускается.